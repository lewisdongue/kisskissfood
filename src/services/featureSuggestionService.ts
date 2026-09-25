import { supabase, TABLES } from '../config/supabase';
import type { FeatureSuggestionWithVotes } from '../types';

const FEATURE_SUGGESTIONS = TABLES.FEATURE_SUGGESTIONS;
const FEATURE_SUGGESTION_VOTES = TABLES.FEATURE_SUGGESTION_VOTES;

/** Fetch all feature suggestions with vote counts, ordered by votes desc then created_at desc */
export async function getFeatureSuggestions(limit = 50): Promise<FeatureSuggestionWithVotes[]> {
    const { data: suggestions, error: suggestionsError } = await supabase
        .from(FEATURE_SUGGESTIONS)
        .select('id, content, user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (suggestionsError || !suggestions?.length) {
        if (suggestionsError) console.error('Error fetching feature suggestions:', suggestionsError);
        return [];
    }

    const ids = suggestions.map((s) => s.id);
    const { data: voteCounts, error: votesError } = await supabase
        .from(FEATURE_SUGGESTION_VOTES)
        .select('suggestion_id')
        .in('suggestion_id', ids);

    if (votesError) {
        console.error('Error fetching vote counts:', votesError);
    }

    const countBySuggestion = (voteCounts || []).reduce<Record<string, number>>((acc, row) => {
        acc[row.suggestion_id] = (acc[row.suggestion_id] || 0) + 1;
        return acc;
    }, {});

    const withVotes: FeatureSuggestionWithVotes[] = suggestions.map((s) => ({
        ...s,
        vote_count: countBySuggestion[s.id] ?? 0,
    }));

    withVotes.sort((a, b) => b.vote_count - a.vote_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return withVotes;
}

/** Submit a new feature suggestion. Optional user_id for authenticated users. */
export async function createFeatureSuggestion(content: string): Promise<FeatureSuggestionWithVotes | null> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from(FEATURE_SUGGESTIONS)
        .insert({
            content: content.trim(),
            user_id: user?.id ?? null,
        })
        .select('id, content, user_id, created_at')
        .single();

    if (error) {
        console.error('Error creating feature suggestion:', error);
        return null;
    }
    return { ...data, vote_count: 0 };
}

/** Toggle vote: if already voted, remove vote; otherwise add vote. Returns new vote count or null on error. */
export async function toggleFeatureSuggestionVote(suggestionId: string): Promise<number | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('User must be authenticated to vote');
        return null;
    }

    const { data: existing } = await supabase
        .from(FEATURE_SUGGESTION_VOTES)
        .select('id')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        await supabase
            .from(FEATURE_SUGGESTION_VOTES)
            .delete()
            .eq('suggestion_id', suggestionId)
            .eq('user_id', user.id);
    } else {
        const { error } = await supabase
            .from(FEATURE_SUGGESTION_VOTES)
            .insert({ suggestion_id: suggestionId, user_id: user.id });
        if (error) {
            console.error('Error voting:', error);
            return null;
        }
    }

    const { count, error: countError } = await supabase
        .from(FEATURE_SUGGESTION_VOTES)
        .select('id', { count: 'exact', head: true })
        .eq('suggestion_id', suggestionId);

    if (countError) return null;
    return count ?? 0;
}

/** Check if the current user has voted for a suggestion */
export async function hasUserVoted(suggestionId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
        .from(FEATURE_SUGGESTION_VOTES)
        .select('id')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', user.id)
        .single();
    return !!data;
}

/** Get set of suggestion IDs the current user has voted for (for UI state) */
export async function getVotedSuggestionIds(): Promise<Set<string>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Set();
    const { data } = await supabase
        .from(FEATURE_SUGGESTION_VOTES)
        .select('suggestion_id')
        .eq('user_id', user.id);
    return new Set((data || []).map((r) => r.suggestion_id));
}
