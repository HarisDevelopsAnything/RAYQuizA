# Realtime Quiz Requirements

## Lobby

- Participants join via quiz code and authenticated profile name.
- Server maintains lobby roster with host designation and broadcasts roster updates.
- Host can start quiz when ready; lobby closes to new joins after quiz start.

## Gameplay

- Server owns quiz state: current question index, timer, and scoring.
- Each question broadcasts: text, options, answerType, image, points, and absolute `endsAt` timestamp.
- Timer auto-advances when deadline reaches, even if host disconnects temporarily.
- Player answers are accepted until timer expiry; first submission per question counts.

## Scoring & Results

- Server validates answers against quiz definition and awards points.
- Scoreboard updates after each question and on demand.
- Final summary includes per-player totals and per-question breakdown for host.

## Reliability

- New clients joining mid-quiz receive latest state snapshot (question, timer, scoreboard).
- Server cleans idle lobbies with no participants to prevent leaks.
- Heartbeat / disconnect handling removes participants and ends quiz if host leaves.
