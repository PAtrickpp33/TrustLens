import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function ReportSuccess() {
  const [params] = useSearchParams();
  const ref = params.get('ref') || 'RPT-XXXX';

  return (
    <main style={{maxWidth:720, margin:'32px auto', padding:'0 16px', textAlign:'center'}}>
      <h1 style={{fontWeight:900, fontSize:26, marginBottom:6}}>Thanks for your report!</h1>
      <div style={{marginBottom:8, fontWeight:700, padding:'6px 12px', border:'1px solid #e5e7eb', borderRadius:999, display:'inline-block'}}>
        Reference: {ref}
      </div>
      <p style={{color:'#475569'}}>
        Your submission was added to our moderation queue. We’ll use it to improve ScamCheck.
      </p>
      <div style={{marginTop:12, display:'flex', gap:8, justifyContent:'center'}}>
        <Link to="/" style={{padding:'10px 14px', border:'1px solid #e5e7eb', borderRadius:10, textDecoration:'none'}}>Back to ScamCheck</Link>
        <Link to="/report" style={{padding:'10px 14px', border:'1px solid #e5e7eb', borderRadius:10, textDecoration:'none'}}>Report another</Link>
      </div>
    </main>
  );
}
