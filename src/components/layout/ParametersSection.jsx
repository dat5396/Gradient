import SectionTitle from './SectionTitle';
import PanelSection from './PanelSection';

import SliderControl from '../controls/SliderControl';

export default function ParametersSection({
    activeGradient,
    params,
    onParamChange,
}) {
    return (
        <PanelSection>
            <SectionTitle>
                Parameters
            </SectionTitle>

            {activeGradient === 'mercury' && (
                <>
                    <SliderControl
                        label="Scale"
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        value={params.scale}
                        onChange={v => onParamChange('mercury', 'scale', v)}
                    />
                    {/* <SliderControl
                        label="Flow speed"
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        value={params.flow}
                        onChange={v => onParamChange('mercury', 'flow', v)}
                    /> */}

                    <SliderControl
                        label="Sheen"
                        min={0.0}
                        max={1.0}
                        step={0.05}
                        value={params.sheen}
                        onChange={v => onParamChange('mercury', 'sheen', v)}
                    />


                    <SliderControl
                        label="Grain noise"
                        min={0.0}
                        max={0.2}
                        step={0.01}
                        value={params.noise}
                        onChange={v => onParamChange('mercury', 'noise', v)}
                    />
                </>
            )}

            {activeGradient === 'wave' && (
                <>
                    <SliderControl
                        label="Scale"
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        value={params.scale}
                        onChange={v => onParamChange('wave', 'scale', v)}
                    />
                    <SliderControl
                        label="Amplitude"
                        min={0.5}
                        max={2.0}
                        step={0.05}
                        value={params.waveAmp}
                        onChange={v => onParamChange('wave', 'waveAmp', v)}
                    />
                    {/* <SliderControl
                        label="Wave speed"
                        min={0.2}
                        max={3.0}
                        step={0.1}
                        value={params.waveSpeed}
                        onChange={v => onParamChange('wave', 'waveSpeed', v)}
                    /> */}
                    <SliderControl
                        label="Blur"
                        min={0.0}
                        max={1.0}
                        step={0.1}
                        value={params.blurAmt}
                        onChange={v => onParamChange('wave', 'blurAmt', v)}
                    />
                </>
            )}

            {/* {activeGradient === 'aurora' && (
                <>
                    <SliderControl
                        label="Blob size"
                        min={0.05}
                        max={0.2}
                        step={0.01}
                        value={params.blobSize}
                        onChange={v => onParamChange('aurora', 'blobSize', v)}
                    />
                    <SliderControl
                        label="Change color Speed"
                        min={0.01}
                        max={0.2}
                        step={0.01}
                        value={params.palSpeed}
                        onChange={v => onParamChange('aurora', 'palSpeed', v)}
                    />
                </>
            )} */}

            {activeGradient === 'plasma' && (
                <>
                    <SliderControl
                        label="Scale"
                        min={0.5} max={2.0} step={0.1}
                        value={params.density}
                        onChange={v => onParamChange('plasma', 'density', v)}
                    />
                    <SliderControl
                        label="Warp"
                        min={0.0} max={1.0} step={0.1}
                        value={params.warp}
                        onChange={v => onParamChange('plasma', 'warp', v)}
                    />
                </>
            )}
        </PanelSection>
    );
}