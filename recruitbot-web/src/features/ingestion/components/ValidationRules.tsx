import React from 'react';

export default function ValidationRules(){
  return (
    <div style={{ marginTop: 10, fontSize: 13, color: '#cbd5e1' }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Validation rules</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        <li>Only PDF files are allowed</li>
        <li>Maximum 5MB allowed</li>
        <li>Please select a file before clicking upload.</li>
      </ul>
    </div>
  );
}
