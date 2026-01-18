'use client';

interface ReadinessRingProps {
  score: number;
  factors: {
    sleep: number;
    recovery: number;
    load: number;
    body: number;
  };
  size?: number;
}

export function ReadinessRing({ score, factors, size = 200 }: ReadinessRingProps) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Main score ring
  const scoreOffset = circumference - (score / 100) * circumference;

  // Get color based on score
  const getColor = (value: number) => {
    if (value >= 75) return 'var(--readiness-high)';
    if (value >= 55) return 'var(--readiness-moderate)';
    return 'var(--readiness-low)';
  };

  const factorList = [
    { key: 'sleep', label: '😴', name: 'Sleep', value: factors.sleep },
    { key: 'recovery', label: '💚', name: 'Recovery', value: factors.recovery },
    { key: 'load', label: '🏋️', name: 'Training Load', value: factors.load },
    { key: 'body', label: '🫀', name: 'Body Status', value: factors.body },
  ];

  // Generate accessible description
  const getScoreDescription = (value: number) => {
    if (value >= 75) return 'high';
    if (value >= 55) return 'moderate';
    return 'low';
  };

  const accessibleDescription = `Readiness score: ${score} out of 100 (${getScoreDescription(score)}). ` +
    factorList.map(f => `${f.name}: ${f.value}% (${getScoreDescription(f.value)})`).join('. ');

  return (
    <div
      style={{ position: 'relative', width: size, height: size }}
      role="img"
      aria-label={accessibleDescription}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />

        {/* Score ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={scoreOffset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />

        {/* Factor indicators */}
        {factorList.map((factor, i) => {
          const angle = -90 + (i * 90);
          const indicatorRadius = radius - strokeWidth - 8;
          const x = center + indicatorRadius * Math.cos((angle * Math.PI) / 180);
          const y = center + indicatorRadius * Math.sin((angle * Math.PI) / 180);
          const indicatorSize = 24;

          return (
            <g key={factor.key} role="img" aria-label={`${factor.name}: ${factor.value}%`}>
              <title>{`${factor.name}: ${factor.value}% (${getScoreDescription(factor.value)})`}</title>
              <circle
                cx={x}
                cy={y}
                r={indicatorSize / 2}
                fill={getColor(factor.value)}
                opacity={0.2}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize: indicatorSize * 0.6 }}
                aria-hidden="true"
              >
                {factor.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: size * 0.25,
            fontWeight: 700,
            color: getColor(score),
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontSize: size * 0.08,
            color: 'var(--text-secondary)',
            marginTop: 4,
          }}
        >
          READINESS
        </div>
      </div>
    </div>
  );
}
