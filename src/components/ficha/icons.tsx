// Set de íconos SVG de línea (currentColor) para la ficha de proyecto. Sin dependencias.
const PATHS: Record<string, string> = {
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  link: '<path d="M9 15l6-6"/><path d="M10.5 6.5l1-1a4 4 0 0 1 6 6l-2 2"/><path d="M13.5 17.5l-1 1a4 4 0 0 1-6-6l2-2"/>',
  download: '<path d="M12 3v12"/><path d="M7 11l5 4 5-4"/><path d="M4 20h16"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  check: '<path d="M5 12l4 4 10-10"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.9 2-2 0-1.3-1-1.8-1-2.8 0-.7.6-1.2 1.4-1.2H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16.5" cy="11.5" r="1"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5Z"/><path d="M3 13l9 5 9-5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z"/>',
  plug: '<path d="M9 3v5M15 3v5"/><path d="M7 8h10v3a5 5 0 0 1-10 0V8Z"/><path d="M12 16v5"/>',
  note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/>',
  tag: '<path d="M3 11l8-8h7a2 2 0 0 1 2 2v7l-8 8a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1 0-2.8Z"/><circle cx="15.5" cy="8.5" r="1.3"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4l-2.5 2.5-2-2 2.5-2.5Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  server: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
};

export function Ico({ name, className = "fi-ico" }: { name: string; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PATHS[name] ?? "" }} />;
}
