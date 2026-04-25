import React, { useState, useMemo } from 'react';
import sportsData from '../../data/sports-data.json';

const TeamCard = ({ team }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const achievementsByYear = useMemo(() => {
    const groupedAchievements = {};
    team.seasons.forEach(season => {
      if (season.achievements.length > 0) {
        groupedAchievements[season.year] = season.achievements;
      }
    });
    return groupedAchievements;
  }, [team]);

  const getAchievementPrefix = (type) => {
    switch (type) {
      case 'national_championship':
        return '★';
      case 'championship':
        return '★';
      case 'college_conference_championship':
        return '•';
      default:
        return '·';
    }
  };

  return (
    <div style={{ marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
      <div>
        <h3 className="text-xl">{team.name}</h3>
        <div style={{ fontSize: '0.8rem'}}>
          <p className="text-sm opacity-75">

          {team.level === "professional"
            ? `${team.league} • ${team.conference}`
            : `${team.level} ${team.sport} • ${team.conference}`
          }
          </p>
        </div>
      </div>

    {/* Championships Summary */}
    {team.seasons.some(season =>
      season.achievements.some(a =>
        a.type === 'championship' || a.type === 'national_championship'
      )
    ) && (
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ fontSize: '1rem' }}>Championships: </div>
        {team.seasons
          .flatMap(season =>
            season.achievements
              .filter(a => a.type === ('championship'))
              .map(a => ({
                year: season.year,
                type: a.type,
                description: a.description
              }))
          )
          .sort((a, b) => b.year - a.year)
          .map((championship, index) => (
            <div key={index} style={{ fontSize: '1rem', marginLeft: '1rem' }}>
              {championship.year}
            </div>
          ))
        }
      </div>
    )}

      {Object.keys(achievementsByYear).length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm underline"
        >
          {isExpanded ? 'Hide achievements' : 'Show achievements'}
        </button>
      )}

      {isExpanded && Object.keys(achievementsByYear).length > 0 && (
        <div className="mt-4 ml-4">
          {Object.entries(achievementsByYear)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, achievements]) => (
              <div key={year} className="mb-4">
                <h4 className="font-bold mb-2">{year}</h4>
                <div className="ml-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className="mb-1">
                    {getAchievementPrefix(achievement.type)} {achievement.description}
                  </div>
                ))}
              </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TeamsTracker = () => {
  const [sortBy, setSortBy] = useState('performance');
  const [filterSport, setFilterSport] = useState('all');

  const teamsWithPoints = useMemo(() => {
    return sportsData.teams.map(team => {
      const totalPoints = team.seasons.reduce((total, season) =>
        total + season.achievements.reduce((seasonTotal, achievement) => {
          if (achievement.points !== undefined) {
            return seasonTotal + achievement.points;
          }

          const defaultPoints = sportsData.achievement_default_points[achievement.type];

          if (achievement.type === 'rival_victory' && achievement.opponent &&
              typeof defaultPoints === 'object' && defaultPoints[achievement.opponent]) {
            return seasonTotal + defaultPoints[achievement.opponent];
          }

          if (defaultPoints !== undefined && typeof defaultPoints !== 'object') {
            return seasonTotal + defaultPoints;
          }

          return seasonTotal;
        }, 0)
      , 0);
      return { ...team, totalPoints };
    });
  }, []);

  const sortedAndFilteredTeams = useMemo(() => {
    let filtered = teamsWithPoints;

    if (filterSport !== 'all') {
      filtered = filtered.filter(team => team.sport === filterSport);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'performance') return b.totalPoints - a.totalPoints;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'sport') return a.sport.localeCompare(b.sport);
      return 0;
    });
  }, [teamsWithPoints, sortBy, filterSport]);

  const sports = [...new Set(sportsData.teams.map(team => team.sport))];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8">

        <div className="flex gap-4 mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-1 border"
          >
            <option value="performance">Sort by Recent Performance</option>
            <option value="name">Sort by Name</option>
            <option value="sport">Sort by Sport</option>
          </select>

          <select
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className="p-1 border"
          >
            <option value="all">All Sports</option>
            {sports.map(sport => (
              <option key={sport} value={sport}>
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        {sortedAndFilteredTeams.map(team => (
          <TeamCard
            key={team.id}
            team={team}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamsTracker;
