-- Migration 0003: Clean Slate
-- Removes any previous placeholder playlists, tracks, and associations
DELETE FROM playlist_songs;
DELETE FROM playlist_tags;
DELETE FROM songs;
DELETE FROM playlists;
