'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash } from 'lucide-react';

interface Card {
  name: string;
  className: string;
  background: string;
  Icon: string;
  description: string;
  href: string;
  cta: string;
}

interface BentoGridEditorProps {
  value: Card[];
  onChange: (value: Card[]) => void;
}

export function BentoGridEditor({ value, onChange }: BentoGridEditorProps) {
  const handleAdd = () => {
    const newCard: Card = {
      name: 'New Card',
      className: 'col-span-1',
      background: '<div>New Card</div>',
      Icon: 'div',
      description: 'New Description',
      href: '#',
      cta: 'Learn More',
    };
    onChange([...value, newCard]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: keyof Card, fieldValue: any) => {
    onChange(
      value.map((c, i) =>
        i === index ? { ...c, [field]: fieldValue } : c
      )
    );
  };

  return (
    <div className="space-y-4">
      {value.map((card, index) => (
        <div key={index} className="flex gap-2 items-start p-2 rounded-md border">
          <div className="flex-1 space-y-2">
            <Input
              value={card.name}
              onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              placeholder="Name"
            />
            <Input
              value={card.className}
              onChange={(e) => handleFieldChange(index, 'className', e.target.value)}
              placeholder="Class Name"
            />
            <Textarea
              value={card.background}
              onChange={(e) => handleFieldChange(index, 'background', e.target.value)}
              placeholder="Background"
            />
            <Input
              value={card.Icon}
              onChange={(e) => handleFieldChange(index, 'Icon', e.target.value)}
              placeholder="Icon"
            />
            <Input
              value={card.description}
              onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
              placeholder="Description"
            />
            <Input
              value={card.href}
              onChange={(e) => handleFieldChange(index, 'href', e.target.value)}
              placeholder="Href"
            />
            <Input
              value={card.cta}
              onChange={(e) => handleFieldChange(index, 'cta', e.target.value)}
              placeholder="CTA"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleRemove(index)}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button onClick={handleAdd}>Add Card</Button>
    </div>
  );
}