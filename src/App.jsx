import React from 'react';

const AureliumApp = () => {
  const tgLink = "https://t.me/AureliumDLC";
  
  const cards = [
    { n: "СТАНДАРТ", t: "30 ДНЕЙ", p: "90 ₽", c: "#a855f7" },
    { n: "ADVANCED", t: "183 ДНЯ", p: "190 ₽", c: "#9333ea" },
    { n: "ELITE", t: "365 ДНЕЙ", p: "230 ₽", c: "#7c3aed" },
    { n: "PREMIUM", t: "LIFETIME", p: "250 ₽", c: "#6d28d9" },
    { n: "PREMIUM+", t: "LIFETIME", p: "450 ₽", c: "#5b21b6" }
  ];

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <center>
        <h1 style={{ letterSpacing: '8px', fontSize: '40px', color: '#a855f7', textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>AURELIUM</h1>
        <p style={{ color: '#444', marginBottom: '50px' }}>PREMIUM MINECRAFT CLIENT</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '1100px' }}>
          {cards.map((card, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${card.c}33`, borderRadius: '15px', padding: '30px', backdropFilter: 'blur(10px)' }}>
              <div style={{ color: card.c, fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>{card.n}</div>
              <div style={{ fontSize: '16px', color: '#888' }}>{card.t}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '20px 0' }}>{card.p}</div>
              <button onClick={() => window.open(tgLink)} style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: card.c, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>КУПИТЬ</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '50px', padding: '30px', border: '1px dashed #333', borderRadius: '20px', display: 'inline-block' }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>НУЖЕН АПГРЕЙД?</p>
          <button onClick={() => window.open(tgLink)} style={{ background: 'none', border: '1px solid #444', color: '#aaa', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px' }}>До Premium (150₽)</button>
          <button onClick={() => window.open(tgLink)} style={{ background: 'none', border: '1px solid #444', color: '#aaa', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>До Premium+ (200₽)</button>
        </div>
      </center>
    </div>
  );
};

export default AureliumApp;