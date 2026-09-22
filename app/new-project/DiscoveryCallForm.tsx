'use client';

import { useActionState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { submitDiscoveryCallRequest, type DiscoveryCallState } from './discovery-actions';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

const initialState: DiscoveryCallState = { status: 'idle', message: '' };

function tomorrowISODate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function DiscoveryCallForm() {
  const [state, formAction, isPending] = useActionState(submitDiscoveryCallRequest, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset();
  }, [state.status]);

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-5 text-center" role="status">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-400" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground mb-1">Request received</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      {state.status === 'error' && !state.fieldErrors && (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <p>{state.message}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="dc-name">Name *</Label>
          <Input id="dc-name" name="name" placeholder="Jane Doe" aria-invalid={!!state.fieldErrors?.name} />
          {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dc-email">Email *</Label>
          <Input
            id="dc-email"
            name="email"
            type="email"
            placeholder="jane@company.com"
            aria-invalid={!!state.fieldErrors?.email}
          />
          {state.fieldErrors?.email && <p className="text-xs text-destructive">{state.fieldErrors.email}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dc-phone">Phone</Label>
        <Input id="dc-phone" name="phone" type="tel" placeholder="Optional" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="dc-date">Preferred date *</Label>
          <Input
            id="dc-date"
            name="preferredDate"
            type="date"
            min={tomorrowISODate()}
            aria-invalid={!!state.fieldErrors?.preferredDate}
          />
          {state.fieldErrors?.preferredDate && (
            <p className="text-xs text-destructive">{state.fieldErrors.preferredDate}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dc-time">Preferred time *</Label>
          <Select name="preferredTime">
            <SelectTrigger id="dc-time" className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map(slot => (
                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors?.preferredTime && (
            <p className="text-xs text-destructive">{state.fieldErrors.preferredTime}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dc-notes">What would you like to discuss? (optional)</Label>
        <Textarea id="dc-notes" name="notes" rows={2} placeholder="Anything specific we should prepare for" />
      </div>

      <p className="text-xs text-muted-foreground/70">
        Times are in Eastern Time (ET). We&apos;ll confirm the exact time by email.
      </p>

      <Button type="submit" disabled={isPending} className="w-full rounded-full">
        {isPending ? 'Requesting…' : 'Request This Time'}
      </Button>
    </form>
  );
}
