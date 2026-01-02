# Future Ideas

## Pro Features (Post-MVP)

### Save to YouTube Account
- **Feature**: Allow Pro users to save generated playlists directly to their YouTube account
- **Requires**: `playlist.insert` OAuth scope
- **Blocker**: Google app verification process (4-6 weeks)
- **Implementation**: Add OAuth flow with YouTube Data API v3, create playlist via `playlists.insert`, add videos via `playlistItems.insert`
