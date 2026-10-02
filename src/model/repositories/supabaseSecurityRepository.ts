import type { SupabaseClient } from '@supabase/supabase-js';
import type { SecurityRepository } from './SecurityRepository';
import type { Report } from '../entities/Report';
import type { UserBlock } from '../entities/UserBlock';

export function createSupabaseSecurityRepository(
  supabase: SupabaseClient | null,
): SecurityRepository {
  const getClient = () => {
    if (!supabase) throw new Error('Supabase not configured');
    return supabase;
  };

  return {
    async blockUser(blockedId: string): Promise<UserBlock> {
      const { data, error } = await getClient()
        .from('user_blocks')
        .insert({ blocked_id: blockedId })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to block user: ${error.message}`);
      }

      return {
        id: data.id,
        blockerId: data.blocker_id,
        blockedId: data.blocked_id,
        createdAt: data.created_at,
      };
    },
    async createReport(
      target: { userId: string | null; listingId: string | null },
      reason: string,
      details: string | null = null,
    ): Promise<Report> {
      const { data, error } = await getClient()
        .from('reports')
        .insert({
          reported_user_id: target.userId,
          reported_listing_id: target.listingId,
          reason,
          details,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create report: ${error.message}`);
      }

      return {
        id: data.id,
        reporterId: data.reporter_id,
        reportedUserId: data.reported_user_id,
        reportedListingId: data.reported_listing_id,
        reason: data.reason,
        details: data.details,
        status: data.status,
        createdAt: data.created_at,
      };
    },
  };
}
