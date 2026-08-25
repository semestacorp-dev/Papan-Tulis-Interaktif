# Security Specification: BGTK Dinas Pendidikan Kota Metro

## 1. Data Invariants
1. **User Identity Invariant**: A user's profile inside the `/users/{userId}` collection can only be written or edited by the authenticated user whose `request.auth.uid` exactly matches `{userId}`.
2. **Immutable Identity**: A user cannot modify their own `role` or `nip` fields to escalate their privileges to `bgtk_admin`.
3. **Session Integrity**: A `/whiteboard_sessions/{sessionId}` document can only be deleted by an authenticated teacher or administrator.
4. **Valid Session Parentage**: An element or message in `/whiteboard_sessions/{sessionId}/elements/{elementId}` must be bound to a valid active session.
5. **Timestamp Temporal Guard**: All creation timestamps must match `request.time` exactly.
6. **Quiz Constraints**: A student can only submit responses that match valid options.

---

## 2. The "Dirty Dozen" Payloads
The following payloads represent malicious attempts to bypass identity, integrity, and state transition boundaries:

1. **Self-Escalation Payload**: A student attempts to write `role: "bgtk_admin"` to their profile.
2. **Identity Spoofing Payload**: Authenticated user `user-123` attempts to write a profile document under `/users/attacker-xyz`.
3. **Ghost Profile Field**: Attempting to write a profile containing a non-existent field `isVerifiedByAdmin: true`.
4. **Session Poisoning ID**: Injecting a 1MB string or invalid characters into `{sessionId}` to cause wallet resource exhaustion.
5. **Unauthorized Session Deletion**: A student or unauthenticated guest attempts to delete a teacher's classroom session.
6. **Immutable Field Modification**: Attempting to change the `createdAt` timestamp of a whiteboard session.
7. **Orphaned Element Addition**: Adding drawing strokes to a non-existent session ID.
8. **Malicious Chat Message**: Injecting a massive message string (e.g. 100KB) into `/whiteboard_sessions/{sessionId}/chat`.
9. **Duplicate Quiz Submission**: Attempting to overwrite another student's quiz response.
10. **State Shortcutting**: Updating a session status from "active" to a terminal state "archived" without being the teacher or admin.
11. **Client-Provided Temporal Attack**: Submitting a custom client-side `createdAt` date far in the future instead of using `request.time`.
12. **PII Query Scraping**: Attempting to scrape all private user email listings by executing a blanket collection query without matching ownership constraints.

---

## 3. Test Specifications (`firestore.rules.test.ts`)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

describe("BGTK Firebase Rules Security Test", () => {
  let testEnv: any;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "alpine-practice-475905-d6",
      firestore: {
        rules: `rules_version = '2'; ...`
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("should deny self-escalation of roles", async () => {
    const context = testEnv.authenticatedContext("student-1");
    const db = context.firestore();
    await assertFails(setDoc(doc(db, "users", "student-1"), {
      role: "bgtk_admin",
      displayName: "Malicious Student"
    }));
  });

  it("should deny writing to another user's profile", async () => {
    const context = testEnv.authenticatedContext("user-abc");
    const db = context.firestore();
    await assertFails(setDoc(doc(db, "users", "user-xyz"), {
      displayName: "Fake Profile"
    }));
  });
});
```
