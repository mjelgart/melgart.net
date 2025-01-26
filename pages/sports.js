import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import injectMetadata from '../components/injectMetadata';
import sportsData from '../data/sports-data.json';

const title = "Michael's Sports Teams";
const description = "Tracking team success during my life."



export default function Page() {
    return (
      <Layout>
        <Head>
          <title>{title}</title>
          <meta
            name="description"
            content={description}
          />
          <meta name="og:title" content={title} />

          {/* facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content="" />

          {/* twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="melgart.net" />
          <meta name="twitter:title" content={title}/>
          <meta name="twitter:description" content={description} />
          {injectMetadata(title, description)}
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>{title}</h1>
          <section>
            <p>This page tracks my various sports teams' performance over time</p>

        </section>
        </article>
      </Layout>
    );
  }

  const TeamCard = ({ team, totalPoints }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    const achievements = useMemo(() => {
      return team.seasons.flatMap(season => 
        season.achievements.map(achievement => ({
          ...achievement,
          year: season.year
        }))
      );
    }, [team]);
  
    const getAchievementIcon = (type) => {
      switch (type) {
        case 'national_championship':
          return <Trophy className="text-yellow-500" />;
        case 'conference_championship':
          return <Medal className="text-blue-500" />;
        case 'rival_victory':
          return <Star className="text-green-500" />;
        default:
          return null;
      }
    };
  
    return (
      <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{team.name}</h3>
              <p className="text-sm text-gray-600">
                {team.level} {team.sport} • {team.conference}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{totalPoints}</p>
              <p className="text-sm text-gray-600">points</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show less' : 'Show achievements'}
          </button>
  
          {isExpanded && achievements.length > 0 && (
            <div className="mt-4 space-y-2">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2">
                  {getAchievementIcon(achievement.type)}
                  <span className="text-sm">
                    {achievement.year} - {achievement.type.replace('_', ' ')}
                    {achievement.opponent && ` vs ${achievement.opponent}`}
                    <span className="ml-2 text-gray-600">
                      +{achievement.points} pts
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };