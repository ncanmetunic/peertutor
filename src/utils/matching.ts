import { User } from '../types';

export interface MatchScore {
  score: number;
  commonSkills: string[];
  complementaryMatches: string[];
  locationMatch: boolean;
  universityMatch: boolean;
}

export class MatchingUtils {
  static calculateMatchScore(user1: User, user2: User): MatchScore {
    let score = 0;
    const commonSkills: string[] = [];
    const complementaryMatches: string[] = [];

    // Find skills that user1 can teach and user2 wants to learn
    const user1TeachesUser2Needs = user1.skills.filter(skill => 
      user2.needs.includes(skill)
    );
    
    // Find skills that user2 can teach and user1 wants to learn
    const user2TeachesUser1Needs = user2.skills.filter(skill => 
      user1.needs.includes(skill)
    );

    // Add complementary matches
    complementaryMatches.push(...user1TeachesUser2Needs, ...user2TeachesUser1Needs);

    // Find common skills (both can teach)
    const sharedSkills = user1.skills.filter(skill => 
      user2.skills.includes(skill)
    );
    commonSkills.push(...sharedSkills);

    // Calculate base score from complementary matches
    score += user1TeachesUser2Needs.length * 20; // High value for mutual benefit
    score += user2TeachesUser1Needs.length * 20;

    // Bonus for bidirectional learning (both can learn from each other)
    if (user1TeachesUser2Needs.length > 0 && user2TeachesUser1Needs.length > 0) {
      score += 30;
    }

    // Small bonus for common skills (potential collaboration)
    score += sharedSkills.length * 5;

    // Location matching
    const locationMatch = user1.city === user2.city && !!user1.city;
    if (locationMatch) {
      score += 15;
    }

    // University matching
    const universityMatch = user1.university === user2.university && !!user1.university;
    if (universityMatch) {
      score += 10;
    }

    // Department matching within same university
    if (universityMatch && user1.department === user2.department && !!user1.department) {
      score += 5;
    }

    return {
      score: Math.min(score, 100), // Cap at 100
      commonSkills,
      complementaryMatches,
      locationMatch,
      universityMatch,
    };
  }

  static isValidMatch(user1: User, user2: User): boolean {
    // Users can't match with themselves
    if (user1.uid === user2.uid) {
      return false;
    }

    // Both users must have public profiles
    if (!user1.visibility.profilePublic || !user2.visibility.profilePublic) {
      return false;
    }

    // At least one user must have skills and the other must have needs
    const user1HasSkills = user1.skills.length > 0;
    const user1HasNeeds = user1.needs.length > 0;
    const user2HasSkills = user2.skills.length > 0;
    const user2HasNeeds = user2.needs.length > 0;

    if (!((user1HasSkills && user2HasNeeds) || (user2HasSkills && user1HasNeeds))) {
      return false;
    }

    // Check if there's any potential match
    const hasComplementaryMatch = 
      user1.skills.some(skill => user2.needs.includes(skill)) ||
      user2.skills.some(skill => user1.needs.includes(skill));

    return hasComplementaryMatch;
  }

  static rankUsers(currentUser: User, users: User[]): User[] {
    const validUsers = users.filter(user => this.isValidMatch(currentUser, user));
    
    const scoredUsers = validUsers.map(user => ({
      user,
      matchScore: this.calculateMatchScore(currentUser, user),
    }));

    // Sort by score descending, then by common skills count
    scoredUsers.sort((a, b) => {
      if (b.matchScore.score !== a.matchScore.score) {
        return b.matchScore.score - a.matchScore.score;
      }
      return b.matchScore.complementaryMatches.length - a.matchScore.complementaryMatches.length;
    });

    return scoredUsers.map(item => item.user);
  }

  static getMatchReasons(user1: User, user2: User): string[] {
    const matchScore = this.calculateMatchScore(user1, user2);
    const reasons: string[] = [];

    if (matchScore.complementaryMatches.length > 0) {
      const user1Teaches = user1.skills.filter(skill => user2.needs.includes(skill));
      const user2Teaches = user2.skills.filter(skill => user1.needs.includes(skill));

      if (user1Teaches.length > 0) {
        reasons.push(`You can teach: ${user1Teaches.join(', ')}`);
      }
      if (user2Teaches.length > 0) {
        reasons.push(`They can teach: ${user2Teaches.join(', ')}`);
      }
    }

    if (matchScore.commonSkills.length > 0) {
      reasons.push(`Shared interests: ${matchScore.commonSkills.join(', ')}`);
    }

    if (matchScore.universityMatch) {
      reasons.push(`Same university: ${user1.university}`);
    }

    if (matchScore.locationMatch) {
      reasons.push(`Same city: ${user1.city}`);
    }

    return reasons;
  }
}