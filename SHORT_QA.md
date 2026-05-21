# TectSoft Assessment — Part 2 Answers

---

## Q1. FlatList vs SectionList vs FlashList

I use Flatlist for simple flat lists, like this assessment's items list. One array of data, straightforward. For example a list of food items or search results.

I use SectionList when data is grouped, like a contacts app where names are grouped by letter A, B, C. FlatList can't do sections cleanly.

I reach for Flashlist when users complain about scroll jank in production. I switched to it in a food delivery app that had 300+ restaurant items with images. FlatList was dropping frames, FlashList fixed it immediately. For small lists under 100 items FlatList is fine.

---

## Q2. Animated API vs Reanimated 3

I normally use Reanimated 3 by default. It runs animations on the UI thread so they never get blocked by JavaScript work. The result is smoother, especially on lower-end Android devices.

I only use the Animated API for very simple one-off animations, like fading in a screen on mount. If the project doesn’t already use Reanimated, adding a native dependency for a tiny animation can feel unnecessary.

---

## Q3. Turning off Hermes

I have never turned off Hermes in a real app. The only scenario where I would consider it is if a third party library we could not replace was incompatible with Hermes. I would turn it off temporarily while finding a proper replacement, not as a permanent fix.

---

## Q4. iOS archive build fails on CI but works locally

In my experience CI archive failures are usually one of two things, stale build artifacts or dependency version mismatches. I start by running a clean build on CI explicitly, then I check that CocoaPods and the Xcode version on CI exactly match what I have locally. Most of the time it is one of those two.



---

## Q5. App crashes sometimes on launch

I open Crashlytics and filter by the crash to see if it is happening on one specific device, one OS version, or for everyone. That usually tells me where to start. I look at the stack trace to find which part of the code crashed, then try to reproduce it locally with the same OS version. "Sometimes" crashes on launch are usually a null value or a race condition during app initialization, something that only triggers under a specific condition, not every time.

---

## Q6. Real bug that took more than a day ⭐

In TestFlight, react-native-iap was firing purchase callbacks multiple times on every app start, even for already completed transactions. I handled the receipts correctly but the callbacks kept replaying and I could not figure out why the issue never showed up in the simulator, only with real sandbox accounts in TestFlight. After two days of debugging I switched to RevenueCat which handles purchase state and receipt verification on their own backend, and the problem disappeared immediately. What would have caught it earlier was testing the full purchase flow in TestFlight from day one instead of relying on the simulator.

---

## Q7. RLS mistake in production ⭐

I have not used Supabase RLS before this assessment but I have dealt with the same problem in Node.js. On TechBible, a SaaS app I inherited, any logged-in user could read another user's data. The routes had no ownership checks at all. I found it while reading through the code after taking over. The fix was simple for every query that fetched user data, I made sure the user_id always came from the logged-in session, not from the request. Same idea as RLS, just done in the backend code instead of the database.

---

## Q8. Edge function vs direct RLS insert

I would use an edge function when the write needs logic the client cannot be trusted with. In this assessment favorites go through an edge function because the user_id must come from the verified JWT on the server, not from the app.
I would use RLS alone when the rule is simple, the user can only touch their own data. For example a user updating their own profile name and dont interfere with items table itself. 

---

## Q9. Schema evolution — favorites to favorite lists

My original favorites table just saves which user liked which item, there is no concept of "which list" it belongs to. So if a user wants multiple named lists like "Breakfast" and "Dinner", the table cannot handle that. To fix it I would create a new table just for storing list names, and add a column to the favorites table that says "this favorite belongs to this list." For existing data I would automatically create one default list for every user and move all their current favorites into it, so nothing gets deleted or breaks.

---

## Q10. Inheriting legacy codebase — class components, Redux thunks

I would not touch the existing code straight away. First I would spend a day or two just reading the codebase to understand which parts are most used and which are risky to touch. Then I would start migrating one module at a time ,create the new version with hooks and Zustand alongside the old one, test it properly, and only delete the old one once I am confident the new one works. Small steps, one module at a time, nothing breaks in production. I would tell the team the plan upfront so nobody is surprised by the changes, and I would make it clear we are not rewriting everything at once we are just slowly replacing old pieces with new ones while the product keeps running normally. That is what i have already done before. Techbible project was in React and i migrated to Next.js using similar approach.