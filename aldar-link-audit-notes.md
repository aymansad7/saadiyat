# Aldar Official Link Integrity Notes

The unit data currently carries `aldar_link` only where an official World of Aldar source URL was captured. Across the published inventory snapshot, 672 of 1,066 purchasable (`Available` or `New`) records have a source-backed URL; the remaining 394 do not.

The reported mobile evidence demonstrates that at least one linked World of Aldar unit page now returns a 404. An official URL must therefore be kept only as recorded source evidence and surfaced as an explicitly-labelled external source action, not reconstructed from project or unit names. Cards without a source-backed URL must not receive a guessed URL.

Direct verification on 27 Aug 2026: the official Mamsha Garden project page at `https://world.aldar.com/uae/abudhabi/mamshagarden` resolves and exposes Towers B1–B7, while the stored individual property URL for `MamshaGarden-B5-01-05` returns HTTP 404. This confirms the upstream individual property route has been withdrawn or changed; it is not safe to redirect that record to a different guessed unit path.

The live project page calls `propertyservice.world.aldar.com`, but its unit query endpoint returned HTTP 401 when inspected in the browser. It cannot be treated as a public live unit source or used to fabricate replacement URLs without Aldar-authorized credentials or a documented feed.

Opening Tower B5 on the live Mamsha Garden project experience confirms that the public interface presents project/building navigation. It did not expose a documented replacement unit URL for the withdrawn `MamshaGarden-B5-01-05` link. The fallback therefore remains the internal exact unit card, not a guessed external destination.
