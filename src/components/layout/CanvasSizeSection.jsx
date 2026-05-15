import SectionTitle from './SectionTitle';
import PanelSection from './PanelSection';

import SizeInputs from '../controls/SizeInputs';

export default function CanvasSizeSection({
    canvasSize,
    onSizeChange,
}) {
    return (
        <PanelSection
            style={{
                borderBottom: 'none',
            }}
        >
            <SectionTitle>
                Canvas size
            </SectionTitle>

            <SizeInputs
                canvasSize={canvasSize}
                onChange={onSizeChange}
            />
        </PanelSection>
    );
}