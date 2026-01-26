# Analytics Dashboard Setup Guide

This document provides guidance on setting up an analytics dashboard for the Body Recovery App, including recommended platforms, key metrics to monitor, and alert thresholds.

## Privacy-First Analytics Platforms

The analytics system is designed to work with privacy-respecting, self-hosted solutions:

### Recommended Platforms

1. **Plausible Analytics** (Recommended)
   - Self-hosted or cloud option
   - GDPR/CCPA compliant by default
   - Lightweight (~1KB script)
   - No cookies required
   - Setup: https://plausible.io/docs/self-hosting

2. **Umami**
   - Fully open-source
   - Self-hosted
   - Privacy-focused
   - Setup: https://umami.is/docs

3. **PostHog** (Self-hosted)
   - Feature flags and A/B testing included
   - Session recordings (opt-in)
   - Self-hosted option available
   - Setup: https://posthog.com/docs/self-host

4. **Matomo**
   - Mature, feature-rich
   - Self-hosted or cloud
   - GDPR compliant
   - Setup: https://matomo.org/docs/installation/

## Integration with Analytics Provider

To integrate a custom analytics provider, implement the `AnalyticsProvider` interface:

```typescript
import { AnalyticsProvider, AnalyticsConfig } from '@/lib/analytics';

const customProvider: AnalyticsProvider = {
  name: 'custom',

  init: (config: AnalyticsConfig) => {
    // Initialize your analytics SDK
  },

  trackEvent: (event) => {
    // Send event to your analytics platform
    fetch('/api/analytics/event', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  trackPageView: (path, properties) => {
    // Track page view
  },

  setUserProperties: (properties) => {
    // Set user properties (anonymized)
  },

  trackTiming: (event) => {
    // Track timing event
  },

  flush: async () => {
    // Flush pending events
  },
};

// Use in analytics initialization
analytics.init({ enabled: true }, customProvider);
```

## Key Metrics to Monitor

### User Engagement

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Daily Active Users (DAU) | Unique users per day | Growing trend | -20% week-over-week |
| Sessions Started | Total workout sessions initiated | Baseline + growth | -30% from baseline |
| Session Completion Rate | Sessions completed / started | > 70% | < 50% |
| Session Abandonment Rate | Sessions abandoned mid-workout | < 30% | > 50% |
| Average Session Duration | Time spent in workout sessions | 15-45 mins | < 5 mins |

### Feature Usage

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| Body Map Usage | Users using pain tracking | > 60% of users | < 30% |
| Progress Chart Views | Users viewing progress | > 50% of users | < 20% |
| AI Assistant Interactions | AI feature usage | Track adoption | N/A |
| Exercise Substitutions | Exercises swapped per session | Track patterns | > 5 per session |
| Pain Logging Frequency | Pain logs per user per week | 2-5 logs/week | Sudden spikes |

### Health & Recovery

| Metric | Description | Purpose |
|--------|-------------|---------|
| Check-in Completion | Daily/weekly check-ins | Track engagement |
| Pain Level Trends | Average reported pain by region | Monitor user health |
| Exercise Completion Rate | Exercises completed vs. assigned | Workout effectiveness |
| Recovery Progress | Pain reduction over time | App effectiveness |

### Performance (Web Vitals)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| FID (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB (Time to First Byte) | < 800ms | 800ms - 1800ms | > 1800ms |
| INP (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |

### Error Monitoring

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Error Rate | Errors per 1000 page views | > 1% |
| Unique Errors | Distinct error types | New errors in production |
| Error Boundary Triggers | React error boundary catches | Any occurrence |
| Unhandled Rejections | Promise rejections | > 0.1% of sessions |

## Dashboard Configuration

### Essential Dashboards

1. **Overview Dashboard**
   - DAU/WAU/MAU trends
   - Session metrics (started, completed, abandoned)
   - Feature adoption rates
   - Error rate overview

2. **User Journey Dashboard**
   - Funnel: Visit > Start Session > Complete Session
   - Feature usage by user segment
   - Retention cohorts

3. **Performance Dashboard**
   - Core Web Vitals by page
   - Slow resources
   - Bundle sizes over time
   - Long task occurrences

4. **Error Dashboard**
   - Error rate trends
   - Top errors by occurrence
   - Error distribution by page/component
   - Rate-limited errors (dropped count)

### Sample Dashboard Queries

#### Session Completion Funnel
```sql
SELECT
  COUNT(CASE WHEN event = 'session_started' THEN 1 END) as started,
  COUNT(CASE WHEN event = 'session_completed' THEN 1 END) as completed,
  COUNT(CASE WHEN event = 'session_abandoned' THEN 1 END) as abandoned
FROM events
WHERE timestamp > NOW() - INTERVAL '7 days'
```

#### Feature Usage by Day
```sql
SELECT
  DATE(timestamp) as date,
  properties->>'feature' as feature,
  COUNT(*) as usage_count
FROM events
WHERE event = 'feature_used'
  AND timestamp > NOW() - INTERVAL '30 days'
GROUP BY date, feature
ORDER BY date, usage_count DESC
```

#### Error Rate by Page
```sql
SELECT
  properties->>'route' as page,
  COUNT(*) as error_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as error_percentage
FROM events
WHERE event = 'error_occurred'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY page
ORDER BY error_count DESC
```

## Alert Configuration

### Critical Alerts (Immediate Response)

| Alert | Condition | Channel |
|-------|-----------|---------|
| High Error Rate | Error rate > 5% for 5 mins | Slack/PagerDuty |
| Zero Sessions | No sessions started for 1 hour | Slack |
| Poor Web Vitals | LCP > 4s for 50%+ users | Email |

### Warning Alerts (Review within 24h)

| Alert | Condition | Channel |
|-------|-----------|---------|
| Declining Engagement | DAU -20% week-over-week | Email |
| High Abandonment | Session abandonment > 40% | Email |
| New Error Type | New error fingerprint detected | Slack |
| Performance Degradation | Web Vitals p75 > warning threshold | Email |

### Weekly Reports

- Feature adoption trends
- User retention metrics
- Performance summary
- Error summary with resolutions

## Privacy Compliance Checklist

- [ ] No PII in event properties (emails, names, etc.)
- [ ] No health data in analytics (pain levels are anonymized)
- [ ] User consent obtained before tracking
- [ ] Do Not Track header respected
- [ ] Anonymous mode available
- [ ] Data retention policy enforced (e.g., 90 days)
- [ ] GDPR data deletion process in place
- [ ] Analytics opt-out visible in settings

## Event Reference

### Session Events
- `session_started` - User starts a workout session
- `session_completed` - User completes a session
- `session_abandoned` - User leaves mid-session
- `session_paused` - User pauses session
- `session_resumed` - User resumes session

### Exercise Events
- `exercise_started` - Exercise begins
- `exercise_completed` - Exercise completed
- `exercise_substituted` - User swaps an exercise
- `exercise_skipped` - User skips an exercise

### Health Events
- `pain_logged` - User logs pain (region only, not specific data)
- `checkin_completed` - User completes check-in
- `body_region_selected` - User interacts with body map

### Plan Events
- `plan_generated` - New plan created
- `plan_modified` - User modifies plan
- `plan_reset` - Plan reset to defaults

### Feature Events
- `feature_used` - Generic feature usage (with feature name)
  - `body_map`, `progress_view`, `settings`, `exercise_library`, `ai_assistant`

### Error Events
- `error_occurred` - Application error
- `error_boundary_triggered` - React error boundary caught error

## Implementation Notes

### Sample Rate Configuration

For high-traffic applications, configure sampling:

```typescript
analytics.init({
  sampleRate: 0.1, // Track 10% of events
});
```

### Debug Mode

Enable debug mode in development:

```typescript
analytics.init({
  debug: process.env.NODE_ENV === 'development',
});
```

### Custom Events

Track custom events while maintaining privacy:

```typescript
// Good - No PII
trackEvent('exercise_completed', {
  exerciseType: 'stretch',
  duration: 30,
  difficulty: 'beginner',
});

// Bad - Contains PII
trackEvent('exercise_completed', {
  userId: 'user@email.com', // Never include!
  userName: 'John Doe',     // Never include!
});
```

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Plausible Analytics Docs](https://plausible.io/docs)
- [PostHog Self-Hosting Guide](https://posthog.com/docs/self-host)
- [GDPR Analytics Compliance](https://gdpr.eu/cookies/)
