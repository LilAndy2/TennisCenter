import { Box } from "@mui/material";
import styled from "styled-components";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
} from "../../styles/theme";

export type ProfileTab = "match-history" | "titles-finals" | "stats";

type ProfileTabsProps = {
    activeTab: ProfileTab;
    onTabChange: (tab: ProfileTab) => void;
};

function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    return (
        <TabsRow>
            <TabButton
                $active={activeTab === "match-history"}
                onClick={() => onTabChange("match-history")}
            >
                Match History
            </TabButton>
            <TabButton
                $active={activeTab === "titles-finals"}
                onClick={() => onTabChange("titles-finals")}
            >
                Titles &amp; Finals
            </TabButton>
            <TabButton
                $active={activeTab === "stats"}
                onClick={() => onTabChange("stats")}
            >
                Stats
            </TabButton>
        </TabsRow>
    );
}

export default ProfileTabs;

const TabsRow = styled(Box)`
    display: flex;
    gap: ${spacing.xs};
    margin-bottom: ${spacing.md};
    flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active: boolean }>`
    height: 2.5rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${({ $active }) => ($active ? colors.primary : colors.surfaceAlt)};
    color: ${({ $active }) => ($active ? "white" : colors.textSecondary)};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${({ $active }) =>
    $active ? colors.primaryHover : colors.surfaceAltHover};
    }

    &:active {
        transform: scale(0.97);
    }
`;