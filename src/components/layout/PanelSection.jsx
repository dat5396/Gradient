import { tokens as t } from '../../styles/tokens';

export default function PanelSection({ children, style = {} }) {
    return (
        <div
            style={{
                padding: `${t.space[4]} ${t.space[6]}`,
                borderBottom: `1px solid ${t.color.border}`,
                ...style,
            }}
        >
            {children}
        </div>
    );
}