import { User, MatchSuggestion } from '../types';

export class MatchingService {
  // Scoring weights
  private static readonly WEIGHTS = {
    skillToNeed: 3,      // w1: user skills match other's needs
    needToSkill: 2,      // w2: user needs match other's skills  
    sameUniversity: 1.5, // w3: same university bonus
    sameCity: 1,         // w4: same city bonus
    profileComplete: 0.5 // bonus for complete profiles
  };

  // Calculate match score between two users
  static calculateMatchScore(user1: User, user2: User): number {
    let score = 0;

    // Base score: skill-need intersections
    const user1SkillsToUser2Needs = this.intersection(user1.skills, user2.needs);
    const user1NeedsToUser2Skills = this.intersection(user1.needs, user2.skills);
    
    score += user1SkillsToUser2Needs.length * this.WEIGHTS.skillToNeed;
    score += user1NeedsToUser2Skills.length * this.WEIGHTS.needToSkill;

    // Location bonuses
    if (user1.university && user2.university && user1.university === user2.university) {
      score += this.WEIGHTS.sameUniversity;
    }
    
    if (user1.city && user2.city && user1.city === user2.city) {
      score += this.WEIGHTS.sameCity;
    }

    // Profile completeness bonus
    const user1Complete = this.getProfileCompleteness(user1);
    const user2Complete = this.getProfileCompleteness(user2);
    score += (user1Complete + user2Complete) / 2 * this.WEIGHTS.profileComplete;

    return Math.round(score * 10) / 10; // Round to 1 decimal place
  }

  // Get common topics between two users
  static getCommonTopics(user1: User, user2: User): string[] {
    const topics = new Set<string>();

    // Skills that match needs
    this.intersection(user1.skills, user2.needs).forEach(topic => topics.add(topic));
    this.intersection(user1.needs, user2.skills).forEach(topic => topics.add(topic));
    
    // Common skills and needs
    this.intersection(user1.skills, user2.skills).forEach(topic => topics.add(topic));
    this.intersection(user1.needs, user2.needs).forEach(topic => topics.add(topic));

    return Array.from(topics);
  }

  // Generate match suggestions for a user
  static generateSuggestions(
    currentUser: User, 
    allUsers: User[], 
    maxSuggestions: number = 10
  ): MatchSuggestion[] {
    const suggestions: MatchSuggestion[] = [];

    for (const otherUser of allUsers) {
      // Skip self and banned users
      if (otherUser.uid === currentUser.uid || otherUser.flags.isBanned) {
        continue;
      }

      // Skip users who don't want to be discovered
      if (!otherUser.visibility.profilePublic) {
        continue;
      }

      const score = this.calculateMatchScore(currentUser, otherUser);
      
      // Only include users with meaningful matches (score > 0)
      if (score > 0) {
        const commonTopics = this.getCommonTopics(currentUser, otherUser);
        
        suggestions.push({
          uid: otherUser.uid,
          score,
          commonTopics,
          lastComputedAt: new Date()
        });
      }
    }

    // Sort by score (descending) and return top matches
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions);
  }

  // Apply decay to match scores based on time and activity
  static applyDecay(suggestion: MatchSuggestion, daysSinceComputed: number): number {
    const decayRate = 0.05; // 5% decay per day
    const decayFactor = Math.exp(-decayRate * daysSinceComputed);
    return Math.round(suggestion.score * decayFactor * 10) / 10;
  }

  // Filter suggestions based on user preferences
  static filterSuggestions(
    suggestions: MatchSuggestion[],
    currentUser: User,
    filters?: {
      minScore?: number;
      topics?: string[];
      university?: string;
      city?: string;
    }
  ): MatchSuggestion[] {
    let filtered = suggestions;

    // Apply minimum score filter
    if (filters?.minScore) {
      filtered = filtered.filter(s => s.score >= filters.minScore!);
    }

    // Apply topic filter
    if (filters?.topics && filters.topics.length > 0) {
      filtered = filtered.filter(s => 
        s.commonTopics.some(topic => filters.topics!.includes(topic))
      );
    }

    return filtered;
  }

  // Helper methods
  private static intersection<T>(array1: T[], array2: T[]): T[] {
    return array1.filter(item => array2.includes(item));
  }

  private static getProfileCompleteness(user: User): number {
    let completeness = 0;
    const maxScore = 8;

    if (user.displayName) completeness += 1;
    if (user.bio && user.bio.length > 10) completeness += 1;
    if (user.university) completeness += 1;
    if (user.department) completeness += 1;
    if (user.city) completeness += 1;
    if (user.experience) completeness += 1;
    if (user.skills.length > 0) completeness += 1;
    if (user.needs.length > 0) completeness += 1;

    return completeness / maxScore;
  }

  // Check if two users are already matched or have pending requests
  static async checkExistingConnection(
    user1Uid: string, 
    user2Uid: string,
    existingMatches: any[], 
    existingRequests: any[]
  ): Promise<'matched' | 'pending' | 'none'> {
    // Check if already matched
    const isMatched = existingMatches.some(match => 
      match.uids.includes(user1Uid) && match.uids.includes(user2Uid)
    );
    
    if (isMatched) return 'matched';

    // Check if request is pending
    const isPending = existingRequests.some(request => 
      (request.fromUid === user1Uid && request.toUid === user2Uid) ||
      (request.fromUid === user2Uid && request.toUid === user1Uid) &&
      request.status === 'pending'
    );

    if (isPending) return 'pending';

    return 'none';
  }

  // Validate skill/need selections
  static validateSkillsAndNeeds(skills: string[], needs: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (skills.length === 0) {
      errors.push('Please select at least one skill');
    }
    
    if (skills.length > 5) {
      errors.push('Maximum 5 skills allowed');
    }

    if (needs.length === 0) {
      errors.push('Please select at least one learning need');
    }
    
    if (needs.length > 5) {
      errors.push('Maximum 5 needs allowed');
    }

    // Check for overlap (user shouldn't have same item as both skill and need)
    const overlap = skills.filter(skill => needs.includes(skill));
    if (overlap.length > 0) {
      errors.push(`Remove duplicate items: ${overlap.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}