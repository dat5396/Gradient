// App.jsx
import { useRef } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PreviewArea from './components/layout/PreviewArea';
import { useGradientState } from './hooks/useGradientState';
import { tokens as t } from './styles/tokens';
import { useVideoExport } from './hooks/useVideoExport';
import { buildAuroraShader } from './shaders/auroraShader';
import { buildPlasmaShader } from './shaders/plasmaShader';
import { buildFlowingShader } from './shaders/flowingShader';
import { buildMercuryShader } from './shaders/mercuryShader';

export default function App() {
  const {
    activeGradient, setActiveGradient,
    speed, setSpeed, paused, setPaused,
    canvasSize, setCanvasSize,
    params, updateParam, randomizePalette,
  } = useGradientState();

  const exportRef = useRef(null);

  const buildShader =
    activeGradient === 'wave' ? buildFlowingShader :
      activeGradient === 'aurora' ? buildAuroraShader :
        activeGradient === 'mercury' ? buildMercuryShader :
          buildPlasmaShader;

  const { exportVideo, progress: exportVideoProgress } = useVideoExport({
    activeGradient, params: params[activeGradient], buildShader,
  });

  function handleSizeChange(newSize) {
    setCanvasSize({
      w: Math.min(Math.max(newSize.w, 100), 4000),
      h: Math.min(Math.max(newSize.h, 100), 4000),
    });
  }

  function handleExport() {
    const canvas = exportRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `gradient-studio-${activeGradient}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div style={{
      height: '100vh', display: 'grid',
      gridTemplateColumns: '1fr 280px',
      gridTemplateRows: 'auto 1fr',
      gridTemplateAreas: '"nav nav" "preview sidebar"',
      overflow: 'hidden', background: t.color.bg,
      color: t.color.text, fontFamily: t.font.sans,
    }}>
      <div style={{
        gridArea: 'nav',
        position: 'relative',
        zIndex: 50,
        overflow: 'visible',
      }}>
        <Navbar
          active={activeGradient} onSwitch={setActiveGradient}
          onExport={handleExport}
          onExportVideo={exportVideo}
          exportVideoProgress={exportVideoProgress}
        />
      </div>
      <div style={{ gridArea: 'preview', overflow: 'hidden' }}>
        <PreviewArea
          activeGradient={activeGradient} params={params}
          speed={speed} paused={paused}
          canvasSize={canvasSize} exportRef={exportRef}
          onPauseChange={setPaused}
        />
      </div>
      <div style={{ gridArea: 'sidebar', overflowY: 'auto', overflowX: 'hidden' }}>
        <Sidebar
          activeGradient={activeGradient} params={params}
          speed={speed} paused={paused} canvasSize={canvasSize}
          onSpeedChange={setSpeed} onPauseChange={setPaused}
          onParamChange={updateParam} onSizeChange={handleSizeChange}
          onRandomizePalette={randomizePalette}
        />
      </div>
    </div>
  );
}