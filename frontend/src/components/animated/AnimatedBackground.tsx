import styled, { keyframes } from "styled-components";

const float1 = keyframes`
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    25%      { transform: translate(12px, -18px) rotate(90deg) scale(1.04); }
    50%      { transform: translate(-8px, -30px) rotate(180deg) scale(1); }
    75%      { transform: translate(15px, -12px) rotate(270deg) scale(0.97); }
`;

const float2 = keyframes`
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    33%      { transform: translate(-20px, 15px) rotate(120deg) scale(1.06); }
    66%      { transform: translate(10px, -20px) rotate(240deg) scale(0.95); }
`;

const float3 = keyframes`
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50%      { transform: translate(18px, 22px) rotate(180deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 0.3; }
    50%      { opacity: 0.8; }
`;

const drift = keyframes`
    0%, 100% { transform: translateX(0); opacity: 0.15; }
    50%      { transform: translateX(20px); opacity: 0.35; }
`;

function AnimatedBackground() {
    return (
        <Container aria-hidden="true">
            <Orb $size="22rem" $top="5%" $left="-8%" $animation={float1} $duration="22s" $opacity={0.12} />
            <Orb $size="18rem" $top="55%" $left="80%" $animation={float2} $duration="26s" $opacity={0.1} />
            <Orb $size="14rem" $top="30%" $left="40%" $animation={float3} $duration="30s" $opacity={0.08} />

            <Dot $size="6px" $top="15%" $left="20%" $delay="0s" />
            <Dot $size="5px" $top="70%" $left="30%" $delay="2s" />
            <Dot $size="5px" $top="25%" $left="75%" $delay="4s" />
            <Dot $size="4px" $top="80%" $left="65%" $delay="1s" />
            <Dot $size="6px" $top="50%" $left="12%" $delay="3s" />
            <Dot $size="4px" $top="40%" $left="88%" $delay="1.5s" />
            <Dot $size="5px" $top="85%" $left="45%" $delay="3.5s" />

            <CourtLine $top="42%" $width="45%" $left="28%" $rotate="-2deg" $delay="0s" />
            <CourtLine $top="58%" $width="30%" $left="50%" $rotate="1deg" $delay="2s" />
            <CourtLine $top="75%" $width="20%" $left="15%" $rotate="-1deg" $delay="4s" />
        </Container>
    );
}

export default AnimatedBackground;

const Container = styled.div`
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
`;

const Orb = styled.div<{
    $size: string;
    $top: string;
    $left: string;
    $animation: ReturnType<typeof keyframes>;
    $duration: string;
    $opacity: number;
}>`
    position: absolute;
    width: ${({ $size }) => $size};
    height: ${({ $size }) => $size};
    top: ${({ $top }) => $top};
    left: ${({ $left }) => $left};
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
    opacity: ${({ $opacity }) => $opacity};
    animation: ${({ $animation }) => $animation} ${({ $duration }) => $duration} ease-in-out infinite;
    will-change: transform;
    filter: blur(40px);
`;

const Dot = styled.div<{
    $size: string;
    $top: string;
    $left: string;
    $delay: string;
}>`
    position: absolute;
    width: ${({ $size }) => $size};
    height: ${({ $size }) => $size};
    top: ${({ $top }) => $top};
    left: ${({ $left }) => $left};
    border-radius: 50%;
    background: white;
    opacity: 0.3;
    animation: ${pulse} 3s ease-in-out ${({ $delay }) => $delay} infinite;
    will-change: opacity;
`;

const CourtLine = styled.div<{
    $top: string;
    $width: string;
    $left: string;
    $rotate: string;
    $delay: string;
}>`
    position: absolute;
    top: ${({ $top }) => $top};
    left: ${({ $left }) => $left};
    width: ${({ $width }) => $width};
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transform: rotate(${({ $rotate }) => $rotate});
    animation: ${drift} 8s ease-in-out ${({ $delay }) => $delay} infinite;
    will-change: transform, opacity;
`;