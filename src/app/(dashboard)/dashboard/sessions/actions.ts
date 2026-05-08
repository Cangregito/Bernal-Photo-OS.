'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseSessionRepository } from '../../../../infrastructure/repositories/SupabaseSessionRepository';

const sessionRepository = new SupabaseSessionRepository();

export async function createSessionAction(formData: {
  clientId: string;
  date: string;
  type: 'wedding' | 'engagement' | 'portrait' | 'event';
  location?: string;
  notes?: string;
}) {
  try {
    await sessionRepository.create({
      ...formData,
      date: new Date(formData.date),
      status: 'pending',
    });
    revalidatePath('/dashboard/sessions');
    revalidatePath('/dashboard/clients');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating session:', error);
    return { success: false, error: message };
  }
}

export async function updateSessionAction(
  sessionId: string,
  formData: {
    date?: string;
    type?: 'wedding' | 'engagement' | 'portrait' | 'event';
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    location?: string;
    notes?: string;
  }
) {
  try {
    await sessionRepository.update(sessionId, {
      ...(formData.date && { date: new Date(formData.date) }),
      ...(formData.type && { type: formData.type }),
      ...(formData.status && { status: formData.status }),
      ...(formData.location !== undefined && { location: formData.location }),
      ...(formData.notes !== undefined && { notes: formData.notes }),
    });
    revalidatePath('/dashboard/sessions');
    revalidatePath('/dashboard/clients');
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error updating session:', error);
    return { success: false, error: message };
  }
}
