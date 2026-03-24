"use client";

import { useFormState } from "react-dom";
import { AlertCircle } from "lucide-react";
import {
  completeInvitation,
  type InvitationFormState
} from "@/app/actions/invitations";

const initialState: InvitationFormState = { error: null };

export function InviteAcceptForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(completeInvitation, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state.error && (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="input-base block w-full"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-foreground"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="input-base block w-full"
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Activar cuenta
      </button>
    </form>
  );
}
