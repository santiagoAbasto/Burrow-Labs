import { cloneElement, useId, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="field-error">
      <span className="hazard" aria-hidden="true">
        <TriangleAlert strokeWidth={2.5} />
      </span>
      <span>{children}</span>
    </p>
  );
}

type ControlProps = {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

type FieldProps = {
  label: ReactNode;
  /** Ayuda bajo el control (así los campos de una misma fila quedan alineados). */
  hint?: ReactNode;
  /** Mensaje de error: marca el control como inválido y se asocia por aria-describedby. */
  error?: ReactNode;
  required?: boolean;
  /** Un solo control: <Input>, <Textarea> o <Select>. Recibe id y aria-* de Field. */
  children: ReactElement<ControlProps>;
  className?: string;
};

/** Label + ayuda + error, asociados al control por id y aria-describedby. */
export function Field({ label, hint, error, required = false, children, className }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("field", className)}>
      <label htmlFor={id} className="field-label">
        {label}
        {!required && <span className="field-optional">(opcional)</span>}
      </label>
      {cloneElement(children, {
        id,
        required: required || undefined,
        "aria-describedby": cn(hintId, errorId) || undefined,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {errorId && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn("control", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cn("control", className)} {...rest} />;
}

/** <select> nativo con la flecha del kit. Los <option> van como children. */
export function Select({ className, ...rest }: ComponentProps<"select">) {
  return (
    <span className="select">
      <select className={cn("control", className)} {...rest} />
      <ChevronDown className="select-chevron" aria-hidden="true" />
    </span>
  );
}

type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> & {
  /** Texto del label (puede incluir enlaces). */
  children: ReactNode;
  error?: ReactNode;
};

export function Checkbox({ children, error, className, ...rest }: CheckboxProps) {
  const errorId = useId();
  return (
    <div className={className}>
      <label className="checkbox">
        <input
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        <span>{children}</span>
      </label>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
