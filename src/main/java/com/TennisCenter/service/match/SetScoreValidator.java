package com.TennisCenter.service.match;

import com.TennisCenter.dto.match.MatchSetScoreRequest;
import com.TennisCenter.exception.ValidationException;
import org.springframework.stereotype.Component;

@Component
public class SetScoreValidator {

    public void validate(MatchSetScoreRequest setRequest) {
        if (setRequest.getSetNumber() == null || setRequest.getSetNumber() < 1) {
            throw new ValidationException("Set number must be at least 1");
        }
        if (setRequest.getPlayerOneGames() == null || setRequest.getPlayerTwoGames() == null) {
            throw new ValidationException("Set scores are required");
        }

        int playerOneGames = setRequest.getPlayerOneGames();
        int playerTwoGames = setRequest.getPlayerTwoGames();

        if (playerOneGames < 0 || playerTwoGames < 0) {
            throw new ValidationException("Games cannot be negative");
        }
        if (playerOneGames == playerTwoGames) {
            throw new ValidationException("A set cannot end in a draw");
        }

        int winnerGames = Math.max(playerOneGames, playerTwoGames);
        int loserGames  = Math.min(playerOneGames, playerTwoGames);
        boolean isTiebreakSet = winnerGames == 7 && loserGames == 6;

        Integer playerOneTiebreak = setRequest.getPlayerOneTiebreakPoints();
        Integer playerTwoTiebreak = setRequest.getPlayerTwoTiebreakPoints();

        if ((playerOneTiebreak == null) != (playerTwoTiebreak == null)) {
            throw new ValidationException("Both tie-break values must be provided");
        }

        if (winnerGames == 6) {
            if (loserGames > 4) {
                throw new ValidationException("Invalid set score. Allowed scores include 6-0 to 6-4");
            }
            if (playerOneTiebreak != null || playerTwoTiebreak != null) {
                throw new ValidationException("Tie-break points are allowed only for 7-6 sets");
            }
            return;
        }

        if (winnerGames == 7) {
            if (loserGames == 5) {
                if (playerOneTiebreak != null || playerTwoTiebreak != null) {
                    throw new ValidationException("Tie-break points are allowed only for 7-6 sets");
                }
                return;
            }

            if (!isTiebreakSet) {
                throw new ValidationException("Invalid set score. Allowed scores include 7-5 and 7-6");
            }
            if (playerOneTiebreak == null || playerTwoTiebreak == null) {
                throw new ValidationException("Tie-break points are required for 7-6 sets");
            }
            if (playerOneTiebreak < 0 || playerTwoTiebreak < 0) {
                throw new ValidationException("Tie-break points cannot be negative");
            }

            boolean playerOneWonSet = playerOneGames > playerTwoGames;
            int winnerTiebreak = playerOneWonSet ? playerOneTiebreak : playerTwoTiebreak;
            int loserTiebreak  = playerOneWonSet ? playerTwoTiebreak : playerOneTiebreak;

            if (winnerTiebreak < 7 || winnerTiebreak - loserTiebreak < 2) {
                throw new ValidationException(
                        "Invalid tie-break score. Winner must have at least 7 points and 2-point difference");
            }
            return;
        }

        throw new ValidationException("Invalid set score. Allowed winner game values are 6 or 7");
    }
}