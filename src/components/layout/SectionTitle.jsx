import { tokens as t } from '../../styles/tokens';

export default function SectionTitle({ children, action }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: t.space[4],
            }}
        >
            <span
                style={{
                    fontSize: t.fontSize.sm,
                    color: t.color.text,
                    fontFamily: t.font.sans,
                    fontWeight: t.fontWeight.semibold,
                    letterSpacing: t.letterSpacing.normal,
                }}
            >
                {children}
            </span>

            {action}
        </div>
    );
}