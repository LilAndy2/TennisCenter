import { ArrowBack, DeleteOutline, EditOutlined } from "@mui/icons-material";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import styled from "styled-components";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
    breakpoints,
} from "../../../styles/theme";

type AdminTournamentHeaderProps = {
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
    extraActions?: ReactNode;
};

function AdminTournamentHeader({
                                   onBack,
                                   onEdit,
                                   onDelete,
                                   extraActions,
                               }: AdminTournamentHeaderProps) {
    return (
        <TopBar>
            <BackButton onClick={onBack}>
                <ArrowBack sx={{ fontSize: 18 }} />
                <span>Back to admin dashboard</span>
            </BackButton>

            <TopBarActions>
                {extraActions}

                <SecondaryActionButton onClick={onEdit}>
                    <EditOutlined sx={{ fontSize: 18 }} />
                    <span>Edit tournament</span>
                </SecondaryActionButton>

                <DangerActionButton onClick={onDelete}>
                    <DeleteOutline sx={{ fontSize: 18 }} />
                    <span>Delete tournament</span>
                </DangerActionButton>
            </TopBarActions>
        </TopBar>
    );
}

export default AdminTournamentHeader;

const TopBar = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${spacing.md};
    margin-bottom: ${spacing.md};

    @media (max-width: ${breakpoints.lg}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const TopBarActions = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    flex-wrap: wrap;
`;

const BackButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.surfaceAlt};
    color: ${colors.textSecondary};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.surfaceAltHover};
    }

    &:active {
        transform: scale(0.97);
    }
`;

const SecondaryActionButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }

    &:active {
        transform: scale(0.97);
    }
`;

const DangerActionButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.dangerBg};
    color: ${colors.danger};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.dangerBgHover};
    }

    &:active {
        transform: scale(0.97);
    }
`;