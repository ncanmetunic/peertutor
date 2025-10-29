import { MatchingUtils } from '../matching';
import { User } from '../../types';

const createMockUser = (overrides: Partial<User>): User => ({
  uid: 'default-uid',
  username: 'testuser',
  displayName: 'Test User',
  email: 'test@example.com',
  skills: [],
  needs: [],
  visibility: {
    profilePublic: true,
    showUniversity: true,
    showCity: true,
  },
  flags: {
    isBanned: false,
    isVerified: false,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('MatchingUtils', () => {
  describe('calculateMatchScore', () => {
    it('should calculate high score for complementary skills', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript', 'React'],
        needs: ['Python', 'Django'],
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['Python', 'Django'],
        needs: ['JavaScript', 'React'],
      });

      const result = MatchingUtils.calculateMatchScore(user1, user2);

      expect(result.score).toBeGreaterThan(80); // Should be high for perfect complementary match
      expect(result.complementaryMatches).toContain('JavaScript');
      expect(result.complementaryMatches).toContain('React');
      expect(result.complementaryMatches).toContain('Python');
      expect(result.complementaryMatches).toContain('Django');
    });

    it('should give bonus for bidirectional learning', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript'],
        needs: ['Python'],
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['Python'],
        needs: ['JavaScript'],
      });

      const result = MatchingUtils.calculateMatchScore(user1, user2);

      // Should get 20 + 20 + 30 (bidirectional bonus) = 70 base score
      expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it('should add location bonus', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript'],
        needs: ['Python'],
        city: 'Istanbul',
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['Python'],
        needs: ['JavaScript'],
        city: 'Istanbul',
      });

      const result = MatchingUtils.calculateMatchScore(user1, user2);

      expect(result.locationMatch).toBe(true);
      // Should include location bonus
      expect(result.score).toBeGreaterThanOrEqual(85);
    });

    it('should add university bonus', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript'],
        needs: ['Python'],
        university: 'MIT',
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['Python'],
        needs: ['JavaScript'],
        university: 'MIT',
      });

      const result = MatchingUtils.calculateMatchScore(user1, user2);

      expect(result.universityMatch).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('should handle common skills', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript', 'React', 'Python'],
        needs: ['Django'],
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['JavaScript', 'Python', 'Django'],
        needs: ['React'],
      });

      const result = MatchingUtils.calculateMatchScore(user1, user2);

      expect(result.commonSkills).toContain('JavaScript');
      expect(result.commonSkills).toContain('Python');
      expect(result.complementaryMatches).toContain('React');
      expect(result.complementaryMatches).toContain('Django');
    });

    it('should cap score at 100', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Vue'],
        needs: ['Python', 'Django', 'FastAPI'],
        city: 'Istanbul',
        university: 'MIT',
        department: 'Computer Science',
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['Python', 'Django', 'FastAPI', 'JavaScript', 'React'],
        needs: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Vue'],
        city: 'Istanbul',
        university: 'MIT',
        department: 'Computer Science',
      });

      const result = MatchingUtils.calculateMatchScore(user1, user2);

      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('isValidMatch', () => {
    it('should return false for same user', () => {
      const user = createMockUser({ uid: 'same-uid' });
      const result = MatchingUtils.isValidMatch(user, user);
      expect(result).toBe(false);
    });

    it('should return false if either profile is not public', () => {
      const user1 = createMockUser({
        uid: 'user1',
        visibility: { ...createMockUser({}).visibility, profilePublic: false },
      });
      const user2 = createMockUser({ uid: 'user2' });

      expect(MatchingUtils.isValidMatch(user1, user2)).toBe(false);
    });

    it('should return false if no complementary skills exist', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript'],
        needs: ['Python'],
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['React'],
        needs: ['Django'],
      });

      expect(MatchingUtils.isValidMatch(user1, user2)).toBe(false);
    });

    it('should return true for valid complementary match', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript'],
        needs: ['Python'],
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['Python'],
        needs: ['JavaScript'],
      });

      expect(MatchingUtils.isValidMatch(user1, user2)).toBe(true);
    });

    it('should return false if both have no skills or needs', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: [],
        needs: [],
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: [],
        needs: [],
      });

      expect(MatchingUtils.isValidMatch(user1, user2)).toBe(false);
    });
  });

  describe('rankUsers', () => {
    it('should rank users by match score', () => {
      const currentUser = createMockUser({
        uid: 'current',
        skills: ['JavaScript'],
        needs: ['Python'],
      });

      const users = [
        createMockUser({
          uid: 'user1',
          skills: ['React'],
          needs: ['Vue'],
        }),
        createMockUser({
          uid: 'user2',
          skills: ['Python'],
          needs: ['JavaScript'],
          city: 'Istanbul',
        }),
        createMockUser({
          uid: 'user3',
          skills: ['Python'],
          needs: ['React'],
        }),
      ];

      const ranked = MatchingUtils.rankUsers(currentUser, users);

      // user2 should be first (complementary + location bonus)
      // user3 should be second (partial complementary)
      // user1 should be filtered out (no match)
      expect(ranked.length).toBe(2);
      expect(ranked[0].uid).toBe('user2');
      expect(ranked[1].uid).toBe('user3');
    });

    it('should filter out invalid matches', () => {
      const currentUser = createMockUser({
        uid: 'current',
        skills: ['JavaScript'],
        needs: ['Python'],
      });

      const users = [
        createMockUser({
          uid: 'current', // Same user
          skills: ['JavaScript'],
          needs: ['Python'],
        }),
        createMockUser({
          uid: 'user2',
          skills: ['React'],
          needs: ['Vue'], // No complementary skills
        }),
        createMockUser({
          uid: 'user3',
          visibility: { ...createMockUser({}).visibility, profilePublic: false }, // Private profile
          skills: ['Python'],
          needs: ['JavaScript'],
        }),
      ];

      const ranked = MatchingUtils.rankUsers(currentUser, users);
      expect(ranked.length).toBe(0);
    });
  });

  describe('getMatchReasons', () => {
    it('should return comprehensive match reasons', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript', 'React'],
        needs: ['Python'],
        city: 'Istanbul',
        university: 'MIT',
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['Python', 'React'],
        needs: ['JavaScript'],
        city: 'Istanbul',
        university: 'MIT',
      });

      const reasons = MatchingUtils.getMatchReasons(user1, user2);

      expect(reasons).toContain('You can teach: JavaScript');
      expect(reasons).toContain('They can teach: Python');
      expect(reasons).toContain('Shared interests: React');
      expect(reasons).toContain('Same university: MIT');
      expect(reasons).toContain('Same city: Istanbul');
    });

    it('should handle cases with only teaching relationship', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript'],
        needs: [],
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: [],
        needs: ['JavaScript'],
      });

      const reasons = MatchingUtils.getMatchReasons(user1, user2);

      expect(reasons).toContain('You can teach: JavaScript');
      expect(reasons).not.toContain('They can teach:');
    });

    it('should return empty array when no match reasons exist', () => {
      const user1 = createMockUser({
        uid: 'user1',
        skills: ['JavaScript'],
        needs: ['Python'],
      });

      const user2 = createMockUser({
        uid: 'user2',
        skills: ['React'],
        needs: ['Vue'],
      });

      const reasons = MatchingUtils.getMatchReasons(user1, user2);
      expect(reasons.length).toBe(0);
    });
  });
});