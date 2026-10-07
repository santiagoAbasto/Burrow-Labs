"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveFicha } from "@/lib/admin/ficha-actions";
import { ESTADOS, type FichaData, type FichaItem, fichaCode, fichaProgress, PRIOS, TAGS, TIPOS } from "@/lib/ficha";
import { Ico } from "./icons";
import "./ficha.css";

type ListKey = "secciones" | "requerimientos" | "peticiones" | "integraciones" | "observaciones" | "descuentos";
type ContactKey = "telefonos" | "emails";
type ScalarKey = { [K in keyof FichaData]: FichaData[K] extends string ? K : never }[keyof FichaData];
type RowField = { field: keyof FichaItem; kind: "t" | "s" | "area" | "tag"; ph?: string };

const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export function Ficha({ initialData, fichaId, token, readOnly = false }: { initialData: FichaData; fichaId?: string; token?: string; readOnly?: boolean }) {
  // Fecha de entrada al abrir una ficha nueva (el código lo fija el servidor al guardar).
  const [data, setData] = useState<FichaData>(() => (!readOnly && fichaId && !initialData.date ? { ...initialData, date: todayStr() } : initialData));
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedAt, setSavedAt] = useState("");
  const [copied, setCopied] = useState(false);
  const firstRun = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ro = readOnly || preview;
  const editable = !readOnly && Boolean(fichaId);

  useEffect(() => {
    if (!editable || !fichaId) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveFicha(fichaId, data);
      if (res.ok) {
        setStatus("saved");
        setSavedAt(new Date().toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" }));
      } else {
        setStatus("error");
      }
    }, 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [data, editable, fichaId]);

  const set = useCallback(<K extends ScalarKey>(k: K, v: string) => setData((d) => ({ ...d, [k]: v })), []);
  const toggleTipo = useCallback((t: string) => setData((d) => ({ ...d, tipos: d.tipos.includes(t) ? d.tipos.filter((x) => x !== t) : [...d.tipos, t] })), []);
  const setItem = useCallback((list: ListKey, idx: number, field: keyof FichaItem, v: string) => setData((d) => ({ ...d, [list]: d[list].map((it, i) => (i === idx ? { ...it, [field]: v } : it)) })), []);
  const addItem = useCallback((list: ListKey, blank: FichaItem) => setData((d) => ({ ...d, [list]: [...d[list], blank] })), []);
  const removeItem = useCallback((list: ListKey, idx: number) => setData((d) => ({ ...d, [list]: d[list].filter((_, i) => i !== idx) })), []);
  const setContact = useCallback((list: ContactKey, idx: number, field: "label" | "v", v: string) => setData((d) => ({ ...d, [list]: d[list].map((it, i) => (i === idx ? { ...it, [field]: v } : it)) })), []);
  const addContact = useCallback((list: ContactKey) => setData((d) => ({ ...d, [list]: [...d[list], { label: "", v: "" }] })), []);
  const removeContact = useCallback((list: ContactKey, idx: number) => setData((d) => ({ ...d, [list]: d[list].filter((_, i) => i !== idx) })), []);

  const progress = useMemo(() => fichaProgress(data), [data]);
  const code = data.code || (data.empresa ? fichaCode(data.empresa, new Date().getFullYear()) : "—");
  const date = data.date || todayStr();

  const copyLink = async () => {
    if (!token) return;
    const url = `${window.location.origin}/ficha/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copiá el enlace para el cliente (solo lectura):", url);
    }
  };

  // Helpers de render invocados como funciones (se inlinan, no remontan los inputs → no se pierde el foco).
  const field = (label: string, k: ScalarKey, opts: { ph?: string; area?: boolean; icon?: string; help?: ReactNode } = {}) => (
    <div className={`fi-field${opts.area ? " wide" : ""}`} key={`f-${k}`}>
      <label>
        {opts.icon ? <Ico name={opts.icon} /> : null}
        <span>{label}</span>
      </label>
      {opts.area ? <textarea value={data[k]} placeholder={opts.ph} rows={3} onChange={(e) => set(k, e.target.value)} /> : <input type="text" value={data[k]} placeholder={opts.ph} onChange={(e) => set(k, e.target.value)} />}
      {opts.help ? <div className="fi-help">{opts.help}</div> : null}
    </div>
  );

  const pills = (label: string, k: ScalarKey, options: readonly string[], cls = "", help?: ReactNode) => (
    <div className="fi-field" key={`p-${k}`}>
      <label>{label}</label>
      <div className="fi-pills">
        {options.map((o) => (
          <button key={o} type="button" className={`fi-pill${cls ? " " + cls : ""}`} aria-pressed={data[k] === o} onClick={() => set(k, o)}>
            {o}
          </button>
        ))}
      </div>
      {help ? <div className="fi-help">{help}</div> : null}
    </div>
  );

  const multi = (label: string, icon: string, list: ContactKey, ph: string) => (
    <div className="fi-field wide" key={`m-${list}`}>
      <label>
        <Ico name={icon} />
        <span>{label}</span>
      </label>
      <div className="fi-rows">
        {data[list].map((it, i) => (
          <div className="fi-row" key={i}>
            <div className="fi-main">
              <input className="s" type="text" value={it.label} placeholder="Nombre / etiqueta" onChange={(e) => setContact(list, i, "label", e.target.value)} />
              <input className="t" type="text" value={it.v} placeholder={ph} onChange={(e) => setContact(list, i, "v", e.target.value)} />
            </div>
            <button type="button" className="fi-rm" title="Quitar" onClick={() => removeContact(list, i)}>
              <Ico name="x" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="fi-add" onClick={() => addContact(list)}>
        <Ico name="plus" />
        <span>Agregar</span>
      </button>
    </div>
  );

  const head = (num: string, title: string, icon: string, opts: { hint?: string; ptag?: boolean } = {}) => (
    <div className="fi-sline">
      <span className="fi-sico">
        <Ico name={icon} />
      </span>
      <span className="fi-n">{num}</span>
      <h2>{title}</h2>
      {opts.ptag ? <span className="fi-ptag">P</span> : null}
      {opts.hint ? <span className="fi-hint">{opts.hint}</span> : null}
    </div>
  );

  const list = (listKey: ListKey, fields: RowField[], blank: FichaItem) => (
    <>
      <div className="fi-rows">
        {data[listKey].map((it, i) => (
          <div className="fi-row" key={i}>
            <span className="fi-idx">{String(i + 1).padStart(2, "0")}</span>
            <div className="fi-main">
              {fields.map((f) =>
                f.kind === "tag" ? (
                  <select key={f.field} className="tag" value={it[f.field] ?? (f.field === "st" ? "Incluido" : TAGS[0])} onChange={(e) => setItem(listKey, i, f.field, e.target.value)}>
                    {(f.field === "st" ? (["Incluido", "A confirmar"] as const) : TAGS).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : f.kind === "area" ? (
                  <textarea key={f.field} className="t" value={it[f.field] ?? ""} placeholder={f.ph} onChange={(e) => setItem(listKey, i, f.field, e.target.value)} />
                ) : (
                  <input key={f.field} className={f.kind} type="text" value={it[f.field] ?? ""} placeholder={f.ph} onChange={(e) => setItem(listKey, i, f.field, e.target.value)} />
                ),
              )}
            </div>
            <button type="button" className="fi-rm" title="Quitar" onClick={() => removeItem(listKey, i)}>
              <Ico name="x" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="fi-add" onClick={() => addItem(listKey, { ...blank })}>
        <Ico name="plus" />
        <span>Agregar</span>
      </button>
    </>
  );

  return (
    <div className={`ficha${ro ? " ro" : ""}`}>
      {!readOnly ? (
        <div className="ficha-toolbar">
          <span className="fi-tt">Ficha de proyecto · Interno</span>
          <span className="fi-sp" />
          {editable ? (
            <span className={`fi-save${status === "saving" ? " saving" : status === "error" ? " err" : ""}`}>
              <span className="fi-dot" />
              {status === "saving" ? "Guardando…" : status === "error" ? "Error al guardar" : savedAt ? `Guardado · ${savedAt}` : "Guardado automático"}
            </span>
          ) : null}
          <button type="button" className="ficha-btn" onClick={() => setPreview((v) => !v)}>
            <Ico name="eye" />
            {preview ? "Volver a editar" : "Vista cliente"}
          </button>
          {token ? (
            <button type="button" className="ficha-btn" onClick={copyLink}>
              <Ico name={copied ? "check" : "link"} />
              {copied ? "Enlace copiado" : "Enlace para el cliente"}
            </button>
          ) : null}
          <button type="button" className="ficha-btn" onClick={() => window.print()}>
            <Ico name="download" />
            Exportar PDF
          </button>
        </div>
      ) : null}

      {ro ? (
        <div className="ficha-viewbar">
          <Ico name="eye" />
          <span>
            Ficha compartida por Burrow Labs · solo lectura — {data.empresa}
            {code !== "—" ? ` · ${code}` : ""}
          </span>
          <button type="button" className="ficha-btn fi-pdf" onClick={() => window.print()}>
            <Ico name="download" />
            Descargar PDF
          </button>
        </div>
      ) : null}

      <div className="ficha-sheet">
        <div className="fi-head">
          <div className="fi-top">
            <div className="fi-htext">
              <div className="fi-eyebrow">Burrow Labs · Codificando soluciones</div>
              <h1>Ficha de Proyecto</h1>
              <div className="fi-sub">Documento de relevamiento: define qué se construye, el alcance técnico y lo que pide el cliente. Lo completa Burrow Labs y se comparte para confirmar.</div>
            </div>
            <div className="fi-hright">
              <div className="fi-hmeta">
                Fecha de entrada
                <br />
                <b>{date}</b>
                <br />
                Código
                <br />
                <b>{code}</b>
              </div>
              <div className="fi-burro" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/mascot.svg" alt="" />
              </div>
            </div>
          </div>
          <div className="fi-prog">
            <div className="fi-bar">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="fi-pct">{progress}% completo</div>
          </div>
        </div>

        <div className="fi-body">
          <div className="fi-section">
            {head("01", "Datos del proyecto", "briefcase")}
            <div className="fi-grid">
              {field("Empresa / cliente", "empresa", { ph: "Nombre de la empresa" })}
              {pills("¿Ya es cliente?", "cliente", ["si", "no"], "ok")}
              {field("Rubro", "rubro", { ph: "A qué se dedica" })}
              {field("Web / sistema actual", "web", { ph: "su sitio o sistema de hoy" })}
              {field("Responsable Burrow", "responsable", { ph: "quién lleva el proyecto" })}
              {field("Equipo", "equipo", { ph: "personas asignadas" })}
            </div>
            <div className="fi-grid" style={{ marginTop: 14 }}>
              {field("Persona(s) de contacto", "contacto", { area: true, ph: "nombres de los contactos" })}
            </div>
            <div className="fi-grid" style={{ marginTop: 14 }}>
              {multi("Teléfonos / WhatsApp", "phone", "telefonos", "+591 ...")}
              {multi("Emails", "mail", "emails", "correo@empresa.com")}
            </div>
            <div className="fi-grid g3" style={{ marginTop: 14 }}>
              {field("Inicio estimado", "inicio", { ph: "dd/mm/aaaa" })}
              {field("Entrega estimada", "entrega", { ph: "dd/mm/aaaa" })}
              {pills("Prioridad", "prioridad", PRIOS, "acc")}
            </div>
            <div className="fi-grid" style={{ marginTop: 14 }}>{pills("Estado", "estado", ESTADOS)}</div>
          </div>

          <div className="fi-section">
            {head("02", "Tipo de proyecto y objetivo", "target")}
            <div className="fi-grid">
              <div className="fi-field wide">
                <label>¿Qué tipo de proyecto es?</label>
                <div className="fi-chips">
                  {TIPOS.map(([label, icon]) => (
                    <button key={label} type="button" className="fi-chip" aria-pressed={data.tipos.includes(label)} onClick={() => toggleTipo(label)}>
                      <Ico name={icon} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <div className="fi-help">
                  Elegí uno o varios. <b>Sitio web</b>: informativo. <b>Tienda online</b>: vende y cobra. <b>Sistema web a medida</b>: aplicación con usuarios, login y base de datos. <b>Landing</b>: una sola página para captar. <b>Automatización/Integración</b>: conectar o acelerar procesos.
                </div>
              </div>
              {field("Objetivo del proyecto", "objetivo", { area: true, ph: "Qué quiere lograr el cliente, en una o dos frases..." })}
              {field("Público objetivo", "publico", { ph: "a quién le habla" })}
              {field("Referencias (sitios que le gustan)", "referencias", { ph: "ejemplos / links" })}
            </div>
          </div>

          <div className="fi-section">
            {head("03", "Definición técnica", "cpu", { hint: "qué construimos y sobre qué" })}
            <div className="fi-grid">
              {pills("¿Es un sistema web?", "esSistemaWeb", ["Sí", "No"], "ok", (<><b>Sistema web</b>: aplicación con usuarios, inicio de sesión y base de datos (panel, CRM o zona privada). <b>No</b> = sitio informativo o vitrina.</>))}
              {pills("¿Responsive?", "responsive", ["Sí", "No"], "ok", (<><b>Responsive</b>: se adapta y se ve bien en celular, tablet y computadora. Recomendado: siempre Sí.</>))}
              {pills("Hosting (servidor)", "hosting", ["Tienen", "No", "Lo provee Burrow"], "", (<><b>Hosting</b>: el servidor donde vive el sitio para estar en línea. Si no tienen, lo gestionamos nosotros.</>))}
              {field("¿Cuál hosting?", "hostingCual", { icon: "server", ph: "proveedor / plan (si tienen)" })}
              {pills("Dominio (.com)", "dominio", ["Tienen", "No", "Lo gestiona Burrow"], "", (<><b>Dominio</b>: la dirección web (ej. empresa.com). Si no tienen, lo registramos.</>))}
              {field("¿Cuál dominio?", "dominioCual", { icon: "globe", ph: "ej. empresa.com" })}
            </div>
            <div className="fi-grid" style={{ marginTop: 14 }}>
              {pills("¿Autogestión de contenido (CMS)?", "cms", ["Sí", "No"], "ok", (<><b>CMS</b>: panel para que el cliente edite textos, fotos y productos por su cuenta.</>))}
              {pills("¿Correo corporativo?", "correo", ["Sí", "No"], "ok", (<>Cuentas de correo con el dominio (ej. info@empresa.com).</>))}
              {pills("¿SEO / Analítica?", "seo", ["Sí", "No"], "ok", (<><b>SEO</b>: para aparecer en Google. <b>Analítica</b>: medir visitas y conversiones.</>))}
              {field("Idiomas", "idiomas", { ph: "ej. Español / Inglés" })}
            </div>
            <div className="fi-grid" style={{ marginTop: 14 }}>
              {field("Integraciones técnicas", "integracionesTec", { area: true, icon: "plug", ph: "pasarela de pago, WhatsApp, CRM, sistema actual, API...", help: "Servicios externos con los que debe conectarse. El detalle fino se confirma con el cliente." })}
              {field("Tecnologías / stack", "stack", { area: true, ph: "a definir por Burrow (ej. Next.js, PostgreSQL)", help: "Normalmente lo define Burrow Labs según el proyecto." })}
            </div>
            <div className="fi-help" style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Ico name="info" />
              <span>
                <b>Seguridad</b>: todos los proyectos incluyen certificado <b>SSL</b> (candado https) y copias de respaldo.
              </span>
            </div>
          </div>

          <div className="fi-section">
            {head("04", "Marca y contenido", "palette")}
            <div className="fi-grid">
              {pills("Logo / manual de marca", "marcaLogo", ["Tiene", "No", "A crear"], "", (<>Si no tiene, Burrow Labs puede crear la identidad (se cotiza aparte).</>))}
              {field("Estilo / tono visual", "estilo", { ph: "ej. moderno, serio, colorido" })}
              {pills("¿Quién provee los textos?", "contTextos", ["Cliente", "Burrow", "Mixto"])}
              {pills("¿Quién provee fotos/videos?", "contFotos", ["Cliente", "Burrow", "Mixto"])}
            </div>
          </div>

          <div className="fi-section">
            {head("05", "Secciones / módulos a desarrollar", "layers", { hint: "qué se construye" })}
            {list("secciones", [{ field: "t", kind: "t", ph: "Sección o módulo" }, { field: "nota", kind: "s", ph: "Detalle / nota" }, { field: "st", kind: "tag" }], { t: "", nota: "", st: "Incluido" })}
          </div>

          <div className="fi-section">
            {head("06", "Requerimientos", "list", { hint: "funcionales" })}
            {list("requerimientos", [{ field: "t", kind: "t", ph: "Requerimiento..." }, { field: "tag", kind: "tag" }], { t: "", tag: "Requisito" })}
          </div>

          <div className="fi-section">
            {head("07", "Peticiones del cliente", "chat", { hint: "lo que pidió explícitamente", ptag: true })}
            {list("peticiones", [{ field: "t", kind: "t", ph: "Petición del cliente..." }, { field: "who", kind: "s", ph: "Quién" }, { field: "when", kind: "s", ph: "Fecha" }], { t: "", who: "Cliente", when: "" })}
          </div>

          <div className="fi-section">
            {head("08", "Integraciones y pedidos especiales", "plug", { hint: "conexiones con sus sistemas" })}
            {list("integraciones", [{ field: "t", kind: "t", ph: "Integración o pedido especial..." }, { field: "tag", kind: "tag" }], { t: "", tag: "Importante" })}
          </div>

          <div className="fi-section">
            {head("09", "Observaciones", "note", { hint: "notas internas" })}
            {list("observaciones", [{ field: "t", kind: "area", ph: "Observación..." }, { field: "who", kind: "s", ph: "Quién" }], { t: "", who: "" })}
          </div>

          <div className="fi-section">
            {head("10", "Condiciones comerciales", "tag")}
            <div className="fi-grid g3">
              {field("Presupuesto", "presupuesto", { ph: "USD ..." })}
              {field("Forma de pago", "pago", { ph: "ej. 50/30/20" })}
              {field("Validez", "validez", { ph: "ej. 7 días" })}
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="fi-help" style={{ fontFamily: "var(--fi-mono)", fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--fi-blue)", marginBottom: 8 }}>
                Descuentos
              </div>
              {list("descuentos", [{ field: "t", kind: "t", ph: "Concepto (ej. Descuento 1)" }, { field: "v", kind: "s", ph: "%" }], { t: "", v: "" })}
            </div>
            <div className="fi-grid" style={{ marginTop: 16 }}>
              {pills("¿Incluye mantenimiento / soporte?", "mantenimiento", ["Sí", "No"], "ok", (<>Soporte, actualizaciones y hosting posterior a la entrega.</>))}
              {field("Detalle de mantenimiento", "mantenimientoDet", { icon: "wrench", ph: "ej. hosting + soporte mensual" })}
            </div>
          </div>

          <div className="fi-section">
            {head("11", "Cierre y seguimiento", "flag")}
            <div className="fi-grid">
              {field("Próxima acción", "proxima", { ph: "qué sigue" })}
              {field("Fecha", "fechaProxima", { ph: "dd/mm/aaaa" })}
              {field("Notas de seguimiento", "notas", { area: true, ph: "acuerdos, pendientes..." })}
            </div>
          </div>
        </div>

        <div className="fi-foot">
          <span>Burrow Labs × {data.empresa || "Cliente"}</span>
          <span>burrowlabs.com.bo · +591 64309353 · info@burrowlabs.com.bo</span>
        </div>
      </div>
    </div>
  );
}
