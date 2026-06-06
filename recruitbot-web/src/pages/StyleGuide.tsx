import React from 'react';
import { Button, Input, Textarea, Card, Badge } from '../ui';

export default function StyleGuide() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Style guide</h1>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Color tokens</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 max-w-xl">
          <div className="p-3 rounded bg-primary text-white">Primary</div>
          <div className="p-3 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Card</div>
          <div className="p-3 rounded" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>Surface</div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Buttons</h2>
        <div className="flex gap-3 mt-3">
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Forms</h2>
        <div className="mt-3 flex flex-col gap-3 max-w-md">
          <Input placeholder="Name" />
          <Textarea placeholder="Short bio" autosize />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium">Cards & Badges</h2>
        <div className="mt-3 flex gap-3 items-start">
          <Card>
            <h3 className="font-medium">Candidate</h3>
            <p className="text-sm text-text-muted">Brief summary inside a card</p>
          </Card>
          <div className="flex flex-col gap-2">
            <Badge>Default</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="success">Success</Badge>
          </div>
        </div>
      </section>
    </div>
  );
}
