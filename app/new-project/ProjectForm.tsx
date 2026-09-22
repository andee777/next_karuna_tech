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
import { services } from '@/components/home/data';
import { submitProjectInquiry, type ProjectInquiryState } from './actions';

const initialProjectInquiryState: ProjectInquiryState = { status: 'idle', message: '' };

const BUDGET_OPTIONS = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $50,000',
  '$50,000+',
  'Not sure yet',
];

export default function ProjectForm() {
  const [state, formAction, isPending] = useActionState(submitProjectInquiry, initialProjectInquiryState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset();
  }, [state.status]);

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-400" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Message sent</h2>
        <p className="text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6" noValidate>
      {state.status === 'error' && !state.fieldErrors && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p>{state.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" placeholder="Jane Doe" aria-invalid={!!state.fieldErrors?.name} />
          {state.fieldErrors?.name && <p className="text-sm text-destructive">{state.fieldErrors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" placeholder="jane@company.com" aria-invalid={!!state.fieldErrors?.email} />
          {state.fieldErrors?.email && <p className="text-sm text-destructive">{state.fieldErrors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Optional"
            aria-invalid={!!state.fieldErrors?.phone}
          />
          {state.fieldErrors?.phone && <p className="text-sm text-destructive">{state.fieldErrors.phone}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredContact">Preferred contact method</Label>
          <Select name="preferredContact" defaultValue="Email">
            <SelectTrigger id="preferredContact" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" placeholder="Optional" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Select name="budget">
            <SelectTrigger id="budget" className="w-full">
              <SelectValue placeholder="Select a range" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectType">What do you need help with?</Label>
        <Select name="projectType">
          <SelectTrigger id="projectType" className="w-full">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map(({ title }) => (
              <SelectItem key={title} value={title}>{title}</SelectItem>
            ))}
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Tell us about your project *</Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="What are you building, what's the timeline, and what does success look like?"
          aria-invalid={!!state.fieldErrors?.message}
        />
        {state.fieldErrors?.message && <p className="text-sm text-destructive">{state.fieldErrors.message}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto rounded-full px-8 py-6 text-base">
        {isPending ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  );
}
