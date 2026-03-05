import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, ChevronDown, ExternalLink } from 'lucide-react';
import * as XLSX from 'xlsx';

const FontLoader = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');`}</style>
);

const fmtFecha = (val) => {
  if (!val && val !== 0) return '—';
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
  }
  if (val instanceof Date) return `${String(val.getDate()).padStart(2,'0')}/${String(val.getMonth()+1).padStart(2,'0')}/${val.getFullYear()}`;
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d)) return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
    return val;
  }
  return String(val);
};

const fmtMonto = (n) =>
  Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── Badge de estado ──────────────────────────────────────────────────────── */
function EstadoBadge({ estado }) {
  const cfg = {
    'Cargado Correctamente': { bg: '#dcfce7', color: '#16a34a', border: '#86efac', icon: '✅' },
    'Requiere Revisión':     { bg: '#fef9c3', color: '#ca8a04', border: '#fde047', icon: '⚠️' },
    'No Cargado':            { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', icon: '❌' },
  }[estado] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', icon: '?' };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700,
      fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
    }}>
      {cfg.icon} {estado}
    </span>
  );
}

/* ─── Acordeón por chofer ──────────────────────────────────────────────────── */
function AcordeonChofer({ grupo, idx, mostrarEstado }) {
  const [abierto, setAbierto] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) setHeight(abierto ? contentRef.current.scrollHeight : 0);
  }, [abierto]);

  const inicial = grupo.chofer.trim().charAt(0).toUpperCase();
  const colores = ['#e94560','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316'];
  const color = colores[grupo.chofer.charCodeAt(0) % colores.length];

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: `2px solid ${abierto ? color : '#f1f5f9'}`,
      transition: 'border-color 0.3s, box-shadow 0.3s',
      boxShadow: abierto ? `0 8px 32px ${color}22` : '0 2px 8px rgba(0,0,0,0.05)',
      background: 'white',
      animationDelay: `${idx * 0.05}s`, animationFillMode: 'both',
      animation: 'fadeSlideUp 0.4s ease',
    }}>
      <button onClick={() => setAbierto(!abierto)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 22px', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left',
        backgroundColor: abierto ? `${color}08` : 'white',
        transition: 'background-color 0.2s',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          background: `${color}18`, border: `2px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.15rem', fontWeight: 900, color,
          fontFamily: "'DM Sans', sans-serif",
        }}>{inicial}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.3px' }}>
            {grupo.chofer}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
            {grupo.fechas || 'Sin fechas registradas'}
          </p>
        </div>

        <div style={{
          background: `${color}15`, color, padding: '5px 14px',
          borderRadius: 20, fontWeight: 800, fontSize: '0.85rem',
          fontFamily: "'DM Mono', monospace", flexShrink: 0, border: `1px solid ${color}30`,
        }}>
          {grupo.cantidad} remito{grupo.cantidad !== 1 ? 's' : ''}
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 130 }}>
          <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color, fontFamily: "'DM Mono', monospace", letterSpacing: '-0.5px' }}>
            ${fmtMonto(grupo.total)}
          </p>
          <p style={{ margin: '1px 0 0', fontSize: '0.72rem', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
            a regularizar
          </p>
        </div>

        <div style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)', color: '#94a3b8', flexShrink: 0 }}>
          <ChevronDown size={22} />
        </div>
      </button>

      <div style={{ height, overflow: 'hidden', transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
        <div ref={contentRef}>
          <div style={{ padding: '0 22px 22px', borderTop: `1px solid ${color}20` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: `${color}08` }}>
                  {['#', 'N° Remito', 'Fecha', 'Monto', 'Patente', ...(mostrarEstado ? ['Estado'] : []), 'Imagen'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px',
                      textAlign: h === 'Monto' ? 'right' : 'left',
                      fontWeight: 700, color: '#475569',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px',
                      borderBottom: `2px solid ${color}20`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grupo.items.map((item, i) => (
                  <tr key={i}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = `${color}06`}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontFamily: "'DM Mono', monospace", fontSize: '0.78rem' }}>
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color, fontFamily: "'DM Mono', monospace" }}>
                      {item.remito}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#334155', fontFamily: "'DM Sans', sans-serif" }}>
                      {item.fecha}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a', fontFamily: "'DM Mono', monospace" }}>
                      ${fmtMonto(item.monto)}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>
                      {item.patente}
                    </td>
                    {mostrarEstado && (
                      <td style={{ padding: '11px 14px' }}>
                        <EstadoBadge estado={item.estado} />
                      </td>
                    )}
                    <td style={{ padding: '11px 14px' }}>
                      {item.imagen ? (
                        <a href={item.imagen} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          color: '#3b82f6', textDecoration: 'none', fontWeight: 600,
                          fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif",
                          background: '#eff6ff', border: '1px solid #bfdbfe',
                          borderRadius: 6, padding: '4px 9px',
                          transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                        >
                          <ExternalLink size={12} /> Ver
                        </a>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '0.76rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: `${color}10`, borderTop: `2px solid ${color}30` }}>
                  <td colSpan={mostrarEstado ? 5 : 4} style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', fontFamily: "'DM Sans', sans-serif", fontSize: '0.84rem' }}>
                    TOTAL A REGULARIZAR
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color, fontFamily: "'DM Mono', monospace", fontSize: '1rem' }}>
                    ${fmtMonto(grupo.total)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════════ */
export default function ReconciliacionCombustible() {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFVP73-8aYjKM_kSj3AE8JScmvjOP-hsw1J83IqrJell-zk5rUsjPBBKrj7aFdn947/exec';

  const [paso, setPaso]             = useState('upload');
  const [rawExcelData, setRawExcel] = useState(null);
  const [columnasExcel, setColumnas]= useState([]);
  const [mapeo, setMapeo]           = useState({ remito:'', chofer:'', patente:'', fecha:'', monto:'' });
  const [reconciliacion, setRecon]  = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [archivoNombre, setNombre]  = useState('');
  const [tabActiva, setTabActiva]   = useState('faltantes');

  const procesarArchivo = (archivo) => {
    setLoading(true); setError(null); setNombre(archivo.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        if (!data.length) { setError('El archivo no tiene datos.'); setLoading(false); return; }
        const cols = Array.from(new Set(data.flatMap(r => Object.keys(r)))).map(k => k.trim()).filter(Boolean);
        setRawExcel(data); setColumnas(cols);

        const auto = { remito:'', chofer:'', patente:'', fecha:'', monto:'' };
        cols.forEach(col => {
          const c = col.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (!auto.remito  && (c.includes('remito')||c.includes('comprobante')||c.includes('nro'))) auto.remito  = col;
          if (!auto.chofer  && (c.includes('chofer')||c.includes('conductor')||c.includes('operario')||c.includes('nombre'))) auto.chofer  = col;
          if (!auto.patente && (c.includes('patente')||c.includes('dominio')||c.includes('vehiculo'))) auto.patente = col;
          if (!auto.fecha   && (c.includes('fecha')||c.includes('date')))  auto.fecha   = col;
          if (!auto.monto   && (c.includes('monto')||c.includes('importe')||c.includes('total')||c.includes('precio'))) auto.monto   = col;
        });
        setMapeo(auto); setPaso('mapeo'); setLoading(false);
      } catch(err) { setError('Error al leer el archivo: ' + err.message); setLoading(false); }
    };
    reader.readAsArrayBuffer(archivo);
  };

  /* ── Reconciliar con 3 estados ───────────────────────────────────────────── */
  const reconciliar = async () => {
    if (!mapeo.remito) { setError('Seleccioná la columna de Remito/Factura.'); return; }
    setLoading(true); setError(null);
    try {
      const res   = await fetch(SCRIPT_URL);
      const sheet = await res.json();
      if (sheet.error) { setError('Error Google Sheet: ' + sheet.error); setLoading(false); return; }

      // Normalizar nombres de columna ignorando variantes de º/° y espacios
      const normalizeKey = (s) => s.toLowerCase()
        .replace(/[º°]/g, 'o')
        .replace(/\s+/g, ' ')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim();

      // Encontrar las keys reales del objeto según nombre normalizado
      const findKey = (obj, targetNorm) =>
        Object.keys(obj).find(k => normalizeKey(k) === targetNorm) || null;

      const KEY_REMITO  = 'no de remito';   // "Nº de Remito" normalizado
      const KEY_FACTURA = 'no de factura';  // "N° de Factura" normalizado
      const KEY_IMAGEN  = 'imagen de respaldo';

      // Normalizar número de remito: extrae XXXX-XXXXXXXX ignorando prefijos como "RE R", "A FT", etc.
      const normalizeRemito = (s) => {
        const str = String(s).trim().toUpperCase();
        const match = str.match(/(\d{4,6}-\d{5,8})$/);
        if (match) return match[1];
        return str.replace(/[^0-9A-Z-]/g, '');
      };

      // Mapa por Nº de Remito → item completo (con imagen)
      const remitosSheet  = new Map();
      // Mapa por Nº de Factura → item completo (para detectar carga en columna errónea)
      const facturasSheet = new Map();

      sheet.forEach(item => {
        const kR = findKey(item, KEY_REMITO);
        const kF = findKey(item, KEY_FACTURA);
        const r  = kR ? normalizeRemito(item[kR]) : '';
        const f  = kF ? normalizeRemito(item[kF]) : '';
        if (r) remitosSheet.set(r, item);
        if (f) facturasSheet.set(f, item);
      });

      // Helper para extraer imagen de un item del sheet
      const getImagen = (item) => {
        const kI = findKey(item, KEY_IMAGEN);
        return kI ? (String(item[kI]).trim() || null) : null;
      };

      const coincidencias  = [];
      const requierenRevision = [];
      const faltantes      = [];
      let montoCubierto = 0, montoRevision = 0, montoFaltante = 0;

      rawExcelData.forEach(item => {
        const remitoRaw = String(item[mapeo.remito] || '').trim();
        const remito = normalizeRemito(remitoRaw);
        if (!remito) return;

        const det = {
          remito: remitoRaw, // mostrar el original en pantalla
          chofer:  mapeo.chofer  ? String(item[mapeo.chofer]  || 'N/A') : 'N/A',
          patente: mapeo.patente ? String(item[mapeo.patente] || 'N/A') : 'N/A',
          monto:   mapeo.monto   ? (parseFloat(item[mapeo.monto]) || 0)  : 0,
          fecha:   mapeo.fecha   ? fmtFecha(item[mapeo.fecha])           : '—',
          imagen:  null,
          estado:  '',
        };

        if (remitosSheet.has(remito)) {
          // ✅ Cargado Correctamente — está en la columna correcta
          const sheetItem = remitosSheet.get(remito);
          det.imagen = getImagen(sheetItem);
          det.estado = 'Cargado Correctamente';
          coincidencias.push(det);
          montoCubierto += det.monto;
        } else if (facturasSheet.has(remito)) {
          // ⚠️ Requiere Revisión — el operario lo cargó en columna Factura en lugar de Remito
          const sheetItem = facturasSheet.get(remito);
          det.imagen = getImagen(sheetItem);
          det.estado = 'Requiere Revisión';
          requierenRevision.push(det);
          montoRevision += det.monto;
        } else {
          // ❌ No Cargado — no aparece en ninguna columna
          det.estado = 'No Cargado';
          faltantes.push(det);
          montoFaltante += det.monto;
        }
      });

      setRecon({
        coincidencias, requierenRevision, faltantes,
        resumen: {
          total: coincidencias.length + requierenRevision.length + faltantes.length,
          encontrados:  coincidencias.length,
          revision:     requierenRevision.length,
          noCargados:   faltantes.length,
          montoCubierto, montoRevision, montoFaltante,
        }
      });
      // Si hay revisiones, mostrar esa tab primero
      setTabActiva(requierenRevision.length > 0 ? 'revision' : faltantes.length > 0 ? 'faltantes' : 'encontrados');
      setPaso('resultado');
    } catch(err) { setError('Error: ' + err.message); }
    setLoading(false);
  };

  const agruparPorChofer = (lista) => {
    const map = {};
    lista.forEach(item => {
      const k = item.chofer || 'Sin nombre';
      if (!map[k]) map[k] = { chofer: k, items: [], total: 0, cantidad: 0, fechas: new Set() };
      map[k].items.push(item);
      map[k].total    += item.monto;
      map[k].cantidad += 1;
      map[k].fechas.add(item.fecha);
    });
    return Object.values(map)
      .map(g => ({ ...g, fechas: Array.from(g.fechas).filter(f => f !== '—').join(' · ') }))
      .sort((a, b) => a.chofer.localeCompare(b.chofer, 'es'));
  };

  const descargarReporte = () => {
    if (!reconciliacion) return;
    const wb = XLSX.utils.book_new();
    const { resumen } = reconciliacion;

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['SER&TEC S.A.S.'],
      ['REPORTE DE RECONCILIACIÓN DE COMBUSTIBLE'],
      ['Generado:', new Date().toLocaleDateString('es-AR')],
      [],
      ['Total reportado',          resumen.total],
      ['✅ Cargado Correctamente', resumen.encontrados],
      ['⚠️ Requiere Revisión',    resumen.revision],
      ['❌ No Cargado',           resumen.noCargados],
      [],
      ['Monto cubierto',  `$${fmtMonto(resumen.montoCubierto)}`],
      ['Monto en revisión',`$${fmtMonto(resumen.montoRevision)}`],
      ['Monto no cargado',`$${fmtMonto(resumen.montoFaltante)}`],
    ]), 'RESUMEN');

    if (reconciliacion.coincidencias.length)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        reconciliacion.coincidencias.map(i => ({ ...i, estado: '✅ Cargado Correctamente' }))
      ), 'CARGADO CORRECTAMENTE');

    if (reconciliacion.requierenRevision.length)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        reconciliacion.requierenRevision.map(i => ({
          chofer: i.chofer, patente: i.patente, remito: i.remito,
          fecha: i.fecha, monto: i.monto,
          estado: '⚠️ Requiere Revisión — cargado en columna Factura',
          imagen: i.imagen || '',
        }))
      ), 'REQUIERE REVISIÓN');

    if (reconciliacion.faltantes.length) {
      const grupos = agruparPorChofer(reconciliacion.faltantes);
      const rows = [
        ['CHOFERES CON COMPROBANTES NO CARGADOS'], [],
        ['Chofer', 'Remitos Pendientes', 'Fechas', 'Monto Total'],
        ...grupos.map(g => [g.chofer, g.cantidad, g.fechas, g.total]),
        [], ['DETALLE'],
        ['Chofer', 'Remito', 'Fecha', 'Monto', 'Patente'],
        ...reconciliacion.faltantes
          .sort((a, b) => a.chofer.localeCompare(b.chofer, 'es'))
          .map(i => [i.chofer, i.remito, i.fecha, i.monto, i.patente]),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'NO CARGADO');
    }

    XLSX.writeFile(wb, `Reconciliacion_SER&TEC_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const reiniciar = () => {
    setPaso('upload'); setRawExcel(null); setColumnas([]);
    setMapeo({ remito:'', chofer:'', patente:'', fecha:'', monto:'' });
    setRecon(null); setError(null); setNombre('');
  };

  const selectStyle = (v) => ({
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `2px solid ${v ? '#10b981' : '#e2e8f0'}`,
    fontSize: '0.88rem', background: v ? '#f0fdf4' : '#f8fafc',
    color: '#1e293b', cursor: 'pointer', outline: 'none',
    fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s',
  });

  return (
    <>
      <FontLoader />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeSlideDown { from { opacity:0; transform:translateY(-20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeSlideUp   { from { opacity:0; transform:translateY(16px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn        { from { opacity:0 }                              to { opacity:1 } }
        @keyframes pulse         { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes float         { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .btn-main:hover  { transform:translateY(-3px)!important; box-shadow:0 16px 40px rgba(233,69,96,.45)!important; }
        .tab-btn:hover   { background:rgba(255,255,255,.18)!important; }
        .select-field:focus { border-color:#e94560!important; background:#fff5f6!important; outline:none; }
        ::-webkit-scrollbar        { width:6px; height:6px; }
        ::-webkit-scrollbar-track  { background:#f1f5f9; }
        ::-webkit-scrollbar-thumb  { background:#e94560; border-radius:3px; }
        .bg-orb { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1c1c2e 50%,#1a0a0e 100%)', fontFamily: "'DM Sans',sans-serif" }}>
        {/* Orbes decorativos */}
        <div className="bg-orb" style={{ width: 500, height: 500, background: 'rgba(233,69,96,0.12)', top: -100, right: -100, animation: 'float 8s ease-in-out infinite' }} />
        <div className="bg-orb" style={{ width: 400, height: 400, background: 'rgba(245,158,11,0.08)', bottom: 100, left: -80, animation: 'float 10s ease-in-out infinite reverse' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

          {/* HEADER */}
          <div style={{ textAlign: 'center', marginBottom: 44, animation: 'fadeSlideDown .6s ease' }}>
            {/* Logo card con diseño premium */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
              {/* Glow detrás */}
              <div style={{
                position: 'absolute', inset: -2, borderRadius: 22,
                background: 'linear-gradient(135deg, #e94560, #f59e0b, #e94560)',
                filter: 'blur(12px)', opacity: 0.5, zIndex: 0,
              }} />
              <div style={{
                position: 'relative', zIndex: 1,
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                background: 'white', padding: '28px 56px 20px', borderRadius: 20,
                boxShadow: '0 24px 64px rgba(0,0,0,.35)',
              }}>
                <img
                  src="https://i.ibb.co/JjspCh7j/Captura-de-pantalla-2026-01-02-161938.png"
                  alt="Logo empresa"
                  style={{ height: 80, maxWidth: 320, objectFit: 'contain' }}
                />
                {/* Línea separadora con gradiente */}
                <div style={{
                  width: '100%', height: 2, margin: '16px 0 12px',
                  background: 'linear-gradient(90deg, transparent, #e94560, #f59e0b, transparent)',
                  borderRadius: 2,
                }} />
                <p style={{
                  margin: 0, color: '#64748b', fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '3px', textTransform: 'uppercase',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Reconciliación de Combustible
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
              {['Cargar archivo', 'Mapear columnas', 'Resultados'].map((s, i) => {
                const activo     = (paso==='upload'&&i===0)||(paso==='mapeo'&&i===1)||(paso==='resultado'&&i===2);
                const completado = (paso==='mapeo'&&i===0)||(paso==='resultado'&&i<=1);
                return (
                  <React.Fragment key={i}>
                    <div style={{
                      padding: '7px 18px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                      background: completado
                        ? 'linear-gradient(135deg,#10b981,#059669)'
                        : activo
                        ? 'linear-gradient(135deg,#e94560,#c41e3a)'
                        : 'rgba(255,255,255,.1)',
                      color: 'white', transition: 'all .3s',
                      boxShadow: activo ? '0 4px 16px rgba(233,69,96,.4)' : completado ? '0 4px 16px rgba(16,185,129,.3)' : 'none',
                      border: activo || completado ? 'none' : '1px solid rgba(255,255,255,.15)',
                    }}>
                      {completado ? '✓ ' : `${i+1}. `}{s}
                    </div>
                    {i < 2 && <ArrowRight size={14} color="rgba(255,255,255,.3)" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* PASO 1: UPLOAD */}
          {paso === 'upload' && (
            <div style={{ background: 'rgba(255,255,255,.98)', borderRadius: 20, padding: 44, boxShadow: '0 25px 60px rgba(0,0,0,.25)', animation: 'fadeIn .5s ease' }}>
              <label style={{
                display: 'block', border: '3px dashed #e94560', borderRadius: 14,
                padding: '72px 40px', textAlign: 'center', cursor: loading ? 'wait' : 'pointer',
                background: 'linear-gradient(135deg,#fdf8f8,#fff5f6)', transition: 'all .3s ease',
              }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = '#ffe5ed'; e.currentTarget.style.transform = 'scale(1.01)'; }}
              onDragLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#fdf8f8,#fff5f6)'; e.currentTarget.style.transform = 'scale(1)'; }}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.background = 'linear-gradient(135deg,#fdf8f8,#fff5f6)'; e.currentTarget.style.transform = 'scale(1)'; if (e.dataTransfer.files[0]) procesarArchivo(e.dataTransfer.files[0]); }}
              >
                <input type="file" accept=".xlsx,.xls,.csv" onChange={e => e.target.files[0] && procesarArchivo(e.target.files[0])} style={{ display: 'none' }} />
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#e94560,#c41e3a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: '0 10px 30px rgba(233,69,96,.35)' }}>
                  <Upload size={42} color="white" />
                </div>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                  {loading ? '⏳ Leyendo...' : '📤 Subí el Excel de la estación'}
                </p>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.92rem' }}>Arrastrá o hacé click · .xlsx .xls .csv</p>
              </label>
            </div>
          )}

          {/* PASO 2: MAPEO */}
          {paso === 'mapeo' && (
            <div style={{ background: 'rgba(255,255,255,.98)', borderRadius: 20, padding: 44, boxShadow: '0 25px 60px rgba(0,0,0,.25)', animation: 'fadeIn .5s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🗂️</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>Mapeá las columnas</h2>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.84rem' }}>{archivoNombre} · {columnasExcel.length} columnas detectadas</p>
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 18px', margin: '20px 0 26px', fontSize: '0.86rem', color: '#92400e' }}>
                ⚠️ <strong>Remito/Factura es obligatorio.</strong> El resto mejora el reporte.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 28 }}>
                {[
                  { key: 'remito',  label: '🔑 Número de Remito / Factura', req: true  },
                  { key: 'chofer',  label: '👤 Chofer / Conductor',          req: false },
                  { key: 'patente', label: '🚗 Patente / Dominio',           req: false },
                  { key: 'fecha',   label: '📅 Fecha de Carga',              req: false },
                  { key: 'monto',   label: '💲 Monto / Importe',             req: false },
                ].map(({ key, label, req }) => (
                  <div key={key} style={{ background: mapeo[key] ? '#f0fdf4' : '#f8fafc', border: `2px solid ${mapeo[key] ? '#86efac' : '#e2e8f0'}`, borderRadius: 12, padding: '16px 18px', transition: 'all .2s' }}>
                    <label style={{ display: 'block', fontWeight: 700, color: '#1e293b', fontSize: '0.88rem', marginBottom: 8 }}>
                      {label} {req && <span style={{ color: '#e94560' }}>*</span>}
                    </label>
                    <select className="select-field" value={mapeo[key]} onChange={e => setMapeo(p => ({ ...p, [key]: e.target.value }))} style={selectStyle(mapeo[key])}>
                      <option value="">— No usar —</option>
                      {columnasExcel.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                    {mapeo[key] && <p style={{ margin: '5px 0 0', fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>✓ Seleccionada</p>}
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontWeight: 700, color: '#64748b', fontSize: '0.82rem', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  👁️ Vista previa – primeras 3 filas
                </p>
                <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        {columnasExcel.map(col => (
                          <th key={col} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', background: Object.values(mapeo).includes(col) ? '#dbeafe' : '#f1f5f9' }}>
                            {Object.values(mapeo).includes(col) ? '🔵 ' : ''}{col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawExcelData.slice(0, 3).map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {columnasExcel.map(col => (
                            <td key={col} style={{ padding: '9px 14px', color: '#334155', whiteSpace: 'nowrap', background: Object.values(mapeo).includes(col) ? '#eff6ff' : 'white' }}>
                              {col === mapeo.fecha ? fmtFecha(row[col]) : String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={reiniciar} style={{ padding: '12px 24px', borderRadius: 10, border: '2px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={15} /> Volver
                </button>
                <button className="btn-main" onClick={reconciliar} disabled={!mapeo.remito || loading} style={{
                  padding: '12px 32px', borderRadius: 10, border: 'none',
                  background: mapeo.remito ? 'linear-gradient(135deg,#e94560,#c41e3a)' : '#94a3b8',
                  color: 'white', fontWeight: 800, cursor: mapeo.remito ? 'pointer' : 'not-allowed',
                  fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: mapeo.remito ? '0 8px 24px rgba(233,69,96,.35)' : 'none', transition: 'all .3s',
                }}>
                  {loading
                    ? <><span style={{ animation: 'pulse 1s infinite' }}>⏳</span> Procesando...</>
                    : <>⚡ Iniciar Reconciliación <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: RESULTADOS */}
          {paso === 'resultado' && reconciliacion && (
            <div style={{ animation: 'fadeIn .5s ease' }}>

              {/* Tarjetas — ahora 5 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { t: 'Total Reportado',           v: reconciliacion.resumen.total,                                       ic: '📊', c: '#3b82f6', bg: '#eff6ff', bd: '#bfdbfe' },
                  { t: '✅ Cargado Correctamente',  v: reconciliacion.resumen.encontrados,                                  ic: '✅', c: '#10b981', bg: '#ecfdf5', bd: '#a7f3d0' },
                  { t: '⚠️ Requiere Revisión',      v: reconciliacion.resumen.revision,                                    ic: '⚠️', c: '#ca8a04', bg: '#fefce8', bd: '#fde047' },
                  { t: '❌ No Cargado',             v: reconciliacion.resumen.noCargados,                                  ic: '❌', c: '#ef4444', bg: '#fef2f2', bd: '#fecaca' },
                  { t: 'Monto Pendiente',           v: `$${fmtMonto(reconciliacion.resumen.montoFaltante + reconciliacion.resumen.montoRevision)}`, ic: '💰', c: '#8b5cf6', bg: '#f5f3ff', bd: '#ddd6fe' },
                ].map((c, i) => (
                  <div key={i} style={{ background: c.bg, borderRadius: 16, padding: '22px 20px', boxShadow: '0 8px 24px rgba(0,0,0,.07)', border: `2px solid ${c.bd}`, transition: 'transform .3s,box-shadow .3s', cursor: 'default' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${c.c}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.07)'; }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.t}</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900, color: c.c, margin: 0, letterSpacing: '-1px', fontFamily: "'DM Mono',monospace" }}>{c.v}</p>
                  </div>
                ))}
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn-main" onClick={descargarReporte} style={{
                  background: 'linear-gradient(135deg,#e94560,#c41e3a)', color: 'white', border: 'none',
                  padding: '13px 34px', borderRadius: 12, fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 8px 24px rgba(233,69,96,.35)', transition: 'all .3s',
                }}>
                  <Download size={20} /> Descargar Reporte Excel
                </button>
                <button onClick={reiniciar} style={{
                  background: 'rgba(255,255,255,.12)', color: 'white', border: '2px solid rgba(255,255,255,.25)',
                  padding: '13px 26px', borderRadius: 12, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', gap: 10, alignItems: 'center', transition: 'all .3s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}>
                  <RefreshCw size={17} /> Nueva Reconciliación
                </button>
              </div>

              {/* TABS — ahora 3 */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'rgba(255,255,255,.1)', padding: 6, borderRadius: 14, width: 'fit-content', flexWrap: 'wrap' }}>
                {[
                  { id: 'revision',    label: `⚠️ Requiere Revisión (${reconciliacion.resumen.revision})`,      activo: reconciliacion.resumen.revision > 0 },
                  { id: 'faltantes',   label: `❌ No Cargado (${reconciliacion.resumen.noCargados})` },
                  { id: 'encontrados', label: `✅ Correctos (${reconciliacion.resumen.encontrados})` },
                ].map(tab => (
                  <button key={tab.id} className="tab-btn" onClick={() => setTabActiva(tab.id)} style={{
                    padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.9rem', transition: 'all .25s',
                    background: tabActiva === tab.id ? 'white' : 'transparent',
                    color: tabActiva === tab.id ? '#0f172a' : 'rgba(255,255,255,.7)',
                    boxShadow: tabActiva === tab.id ? '0 4px 12px rgba(0,0,0,.12)' : 'none',
                    fontFamily: "'DM Sans',sans-serif",
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB: REQUIERE REVISIÓN */}
              {tabActiva === 'revision' && (
                <div style={{ animation: 'fadeIn .3s ease' }}>
                  {reconciliacion.requierenRevision.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 16, padding: 56, textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', margin: 0 }}>Sin casos para revisar.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ background: 'rgba(254,252,232,.15)', border: '1px solid rgba(253,224,71,.3)', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <AlertCircle size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ margin: 0, color: 'rgba(255,255,255,.85)', fontSize: '0.86rem', lineHeight: 1.6 }}>
                          <strong style={{ color: 'white' }}>Estos remitos fueron encontrados en el Sheet pero en la columna equivocada:</strong><br />
                          El operario los cargó en <strong style={{ color: '#fde047' }}>N° de Factura</strong> en lugar de <strong style={{ color: '#fde047' }}>Nº de Remito</strong>. Hacé click en "Ver" para revisar la imagen del comprobante.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {agruparPorChofer(reconciliacion.requierenRevision).map((grupo, i) => (
                          <AcordeonChofer key={grupo.chofer} grupo={grupo} idx={i} mostrarEstado={false} />
                        ))}
                      </div>
                      <div style={{ marginTop: 20, background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,.7)', fontWeight: 700, fontSize: '0.9rem' }}>MONTO EN REVISIÓN</p>
                        <p style={{ margin: 0, color: '#fbbf24', fontWeight: 900, fontSize: '1.4rem', fontFamily: "'DM Mono',monospace" }}>
                          ${fmtMonto(reconciliacion.resumen.montoRevision)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB: NO CARGADO */}
              {tabActiva === 'faltantes' && (
                <div style={{ animation: 'fadeIn .3s ease' }}>
                  {reconciliacion.faltantes.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 16, padding: 56, textAlign: 'center' }}>
                      <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>🎉</div>
                      <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', margin: 0 }}>¡Todo en orden! No hay comprobantes pendientes.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertCircle size={18} color="#fbbf24" />
                        <p style={{ margin: 0, color: 'rgba(255,255,255,.8)', fontSize: '0.86rem' }}>
                          <strong style={{ color: 'white' }}>{agruparPorChofer(reconciliacion.faltantes).length} choferes</strong> con remitos no cargados en el Sheet
                          &nbsp;·&nbsp; Orden <strong style={{ color: 'white' }}>A → Z</strong>
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {agruparPorChofer(reconciliacion.faltantes).map((grupo, i) => (
                          <AcordeonChofer key={grupo.chofer} grupo={grupo} idx={i} mostrarEstado={false} />
                        ))}
                      </div>
                      <div style={{ marginTop: 20, background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,.7)', fontWeight: 700, fontSize: '0.9rem' }}>TOTAL PENDIENTE A REGULARIZAR</p>
                        <p style={{ margin: 0, color: '#ef4444', fontWeight: 900, fontSize: '1.4rem', fontFamily: "'DM Mono',monospace" }}>
                          ${fmtMonto(reconciliacion.resumen.montoFaltante)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB: ENCONTRADOS */}
              {tabActiva === 'encontrados' && (
                <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,.08)', animation: 'fadeIn .3s ease' }}>
                  {reconciliacion.coincidencias.length === 0
                    ? <p style={{ textAlign: 'center', color: '#94a3b8', padding: 32, fontWeight: 600 }}>No se encontraron coincidencias.</p>
                    : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                              {['Remito', 'Chofer', 'Patente', 'Monto', 'Fecha', 'Imagen'].map(h => (
                                <th key={h} style={{ padding: '14px 16px', textAlign: h === 'Monto' ? 'right' : 'left', fontWeight: 700, color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[...reconciliacion.coincidencias]
                              .sort((a, b) => a.chofer.localeCompare(b.chofer, 'es'))
                              .map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <td style={{ padding: '13px 16px', fontWeight: 700, color: '#10b981', fontFamily: "'DM Mono',monospace" }}>{item.remito}</td>
                                  <td style={{ padding: '13px 16px', color: '#334155' }}>{item.chofer}</td>
                                  <td style={{ padding: '13px 16px', color: '#64748b' }}>{item.patente}</td>
                                  <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, color: '#10b981', fontFamily: "'DM Mono',monospace" }}>${fmtMonto(item.monto)}</td>
                                  <td style={{ padding: '13px 16px', color: '#64748b' }}>{item.fecha}</td>
                                  <td style={{ padding: '13px 16px' }}>
                                    {item.imagen ? (
                                      <a href={item.imagen} target="_blank" rel="noopener noreferrer" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        color: '#3b82f6', textDecoration: 'none', fontWeight: 600,
                                        fontSize: '0.78rem', background: '#eff6ff', border: '1px solid #bfdbfe',
                                        borderRadius: 6, padding: '4px 9px', transition: 'all 0.2s',
                                      }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; }}
                                      >
                                        <ExternalLink size={12} /> Ver
                                      </a>
                                    ) : <span style={{ color: '#cbd5e1', fontSize: '0.76rem' }}>—</span>}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '2px solid #f87171', borderRadius: 12, padding: '16px 20px', marginTop: 22, display: 'flex', gap: 12, alignItems: 'center', color: '#991b1b', animation: 'fadeIn .3s ease' }}>
              <AlertCircle size={22} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>{error}</span>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
