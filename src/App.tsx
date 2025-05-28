import React, { useState } from "react";

// --- Helpers and constants ---
const periodLabels = ["1", "2", "3", "OT"];
const initialStats = () => ({
  homeShots: [0, 0, 0, 0],
  awayShots: [0, 0, 0, 0],
  homeGoals: [0, 0, 0, 0],
  awayGoals: [0, 0, 0, 0],
});

export default function ShotsOnGoalApp() {
  // --- State ---
  const [period, setPeriod] = useState(0);
  const [stats, setStats] = useState(initialStats());
  const [lastAction, setLastAction] = useState(null);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [savedGames, setSavedGames] = useState([]);

  // --- Export CSV (Upgraded) ---
  function exportToCSV() {
    if (!savedGames.length) return;
    const header = [
      "Date", "Home", "Away", "Period", "Home Shots", "Away Shots", "Home Goals", "Away Goals"
    ];
    const rows = savedGames.flatMap(g =>
      g.periods.map(p =>
        [
          g.date, g.homeTeam, g.awayTeam, p.label, p.homeShots, p.awayShots, p.homeGoals, p.awayGoals
        ].map(cell => `"${cell}"`).join(",")
      )
    );
    const csv = [header.map(h => `"${h}"`).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shots_on_goal_stats.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Save Game / New Game ---
  function handleSaveGame() {
    const summary = {
      date: new Date().toLocaleString(),
      homeTeam,
      awayTeam,
      periods: periodLabels.map((label, i) => ({
        label,
        homeShots: stats.homeShots[i],
        awayShots: stats.awayShots[i],
        homeGoals: stats.homeGoals[i],
        awayGoals: stats.awayGoals[i]
      })),
      homeTotalShots: stats.homeShots.reduce((a, b) => a + b, 0),
      awayTotalShots: stats.awayShots.reduce((a, b) => a + b, 0),
      homeTotalGoals: stats.homeGoals.reduce((a, b) => a + b, 0),
      awayTotalGoals: stats.awayGoals.reduce((a, b) => a + b, 0)
    };
    setSavedGames(games => [...games, summary]);
  }
  function handleNewGame() {
    setStats(initialStats());
    setPeriod(0);
    setGameStarted(false);
    setHomeTeam("");
    setAwayTeam("");
  }

  // --- Main logic for SOG/Goals/Undo/Reset ---
  const updateStat = (team, statType, delta) => {
    setStats((prev) => {
      const newArr = [...prev[statType]];
      newArr[period] += delta;
      return { ...prev, [statType]: newArr };
    });
  };
  const handleShot = (team) => {
    const statType = team === "home" ? "homeShots" : "awayShots";
    updateStat(team, statType, 1);
    setLastAction(() => () => updateStat(team, statType, -1));
  };
  const handleGoal = (team) => {
    const statType = team === "home" ? "homeGoals" : "awayGoals";
    updateStat(team, statType, 1);
    setLastAction(() => () => updateStat(team, statType, -1));
  };
  const handleUndo = () => {
    if (lastAction) lastAction();
    setLastAction(null);
  };
  const handleReset = () => {
    setStats(initialStats());
    setLastAction(null);
  };

  // --- Team Name Entry screen ---
  if (!gameStarted) {
    return (
      <div style={{
        fontFamily: 'system-ui, sans-serif', background: '#003087', minHeight: '100vh', color: 'white',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <img
          src="/blues_logo.png"
          alt="Blues Logo"
          style={{ width: 120, margin: '30px auto 10px', display: 'block' }}
        />
        <h2>Start New Game</h2>
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Home Team Name"
            value={homeTeam}
            onChange={e => setHomeTeam(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Away Team Name"
            value={awayTeam}
            onChange={e => setAwayTeam(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button
          style={{ ...blueBtn, width: 180, fontSize: 22 }}
          disabled={!homeTeam || !awayTeam}
          onClick={() => setGameStarted(true)}
        >
          Start Game
        </button>
      </div>
    );
  }

  // --- Main App UI ---
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif', background: '#003087', minHeight: '100vh', color: 'white',
      padding: 0, margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <img
        src="/blues_logo.png"
        alt="Blues Logo"
        style={{ width: 120, margin: '30px auto 10px', display: 'block' }}
      />
      {/* Period selector */}
      <div style={{ margin: '36px 0 18px 0', fontSize: 28, display: 'flex', alignItems: 'center' }}>
        <button onClick={() => setPeriod((p) => Math.max(0, p - 1))} style={navBtnStyle}>&#9664;</button>
        <span style={{ margin: '0 20px', fontWeight: 700 }}>Period: {periodLabels[period]}</span>
        <button onClick={() => setPeriod((p) => Math.min(3, p + 1))} style={navBtnStyle}>&#9654;</button>
      </div>

      {/* Scoreboard & Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 56, width: '100%', maxWidth: 800 }}>
        {/* Home */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160 }}>
          <div style={{ color: '#3ea6ff', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{homeTeam || "HOME"}</div>
          <div style={countStyle}>Shots: {stats.homeShots[period]}</div>
          <button style={blueBtn} onClick={() => handleShot('home')}>🔵 SOG</button>
          <div style={countStyle}>Goals: {stats.homeGoals[period]}</div>
          <button style={blueBtnGoal} onClick={() => handleGoal('home')}>🔵 Goal</button>
        </div>
        {/* Away */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160 }}>
          <div style={{ color: '#ff494d', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{awayTeam || "AWAY"}</div>
          <div style={countStyle}>Shots: {stats.awayShots[period]}</div>
          <button style={redBtn} onClick={() => handleShot('away')}>🔴 SOG</button>
          <div style={countStyle}>Goals: {stats.awayGoals[period]}</div>
          <button style={redBtnGoal} onClick={() => handleGoal('away')}>🔴 Goal</button>
        </div>
      </div>

      {/* Undo / Reset */}
      <div style={{ display: 'flex', gap: 36, marginTop: 40 }}>
        <button style={grayBtn} onClick={handleUndo}>↩️ Undo</button>
        <button style={grayBtn} onClick={handleReset}>🔄 Reset</button>
      </div>

      {/* Save Game / New Game */}
      <div style={{ marginTop: 28 }}>
        <button style={{ ...blueBtn, width: 200 }} onClick={handleSaveGame}>Save Game</button>
        <button style={{ ...grayBtn, width: 200, marginLeft: 16 }} onClick={handleNewGame}>New Game</button>
      </div>

      {/* Saved Games Table & CSV Export */}
      {savedGames.length > 0 && (
        <div style={{ margin: '40px 0', maxWidth: 800 }}>
          <h3>Saved Games</h3>
          <table style={{ width: '100%', background: '#232a36', color: '#fff', borderRadius: 8, fontSize: 15 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Home</th>
                <th>Away</th>
                <th>H SOG</th>
                <th>A SOG</th>
                <th>H Goals</th>
                <th>A Goals</th>
              </tr>
            </thead>
            <tbody>
              {savedGames.map((g, i) => (
                <tr key={i}>
                  <td>{g.date}</td>
                  <td>{g.homeTeam}</td>
                  <td>{g.awayTeam}</td>
                  <td>{g.homeTotalShots}</td>
                  <td>{g.awayTotalShots}</td>
                  <td>{g.homeTotalGoals}</td>
                  <td>{g.awayTotalGoals}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={{ ...blueBtn, width: 170, marginTop: 16 }} onClick={exportToCSV}>Export CSV</button>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const navBtnStyle = {
  background: '#232a36', border: 'none', color: '#fff', borderRadius: 10,
  fontSize: 32, width: 46, height: 46, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const countStyle = {
  fontSize: 22, margin: '10px 0 6px 0', fontWeight: 500
};
const blueBtn = {
  width: 130, height: 52, background: 'linear-gradient(90deg, #3ea6ff 60%, #1b5fa7 100%)',
  color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 18, marginBottom: 10, cursor: 'pointer',
};
const blueBtnGoal = {
  ...blueBtn, background: 'linear-gradient(90deg, #9fdcff 60%, #3ea6ff 100%)', height: 38, fontSize: 18
};
const redBtn = {
  width: 130, height: 52, background: 'linear-gradient(90deg, #ff494d 60%, #aa2225 100%)',
  color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 18, marginBottom: 10, cursor: 'pointer',
};
const redBtnGoal = {
  ...redBtn, background: 'linear-gradient(90deg, #ffb1b3 60%, #ff494d 100%)', height: 38, fontSize: 18
};
const grayBtn = {
  minWidth: 100, height: 40, background: '#232a36', color: '#fff', fontWeight: 600,
  fontSize: 18, border: 'none', borderRadius: 14, cursor: 'pointer',
};
const inputStyle = {
  padding: '12px 14px',
  fontSize: 20,
  borderRadius: 8,
  border: '1px solid #555',
  width: 220,
  marginBottom: 6,
  background: '#232a36',
  color: '#fff'
};
