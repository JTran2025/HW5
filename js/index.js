// File: index.css
// GUI Assignment: HW5 Implementing a Bit of Scrabble with Drag-and-Drop
// Julian Tran, UMass Lowell Computer Science, Julian_Tran@student.uml.edu
// Copyright (c) 2024 by Julian. All rights reserved. May be freely copied or
// excerpted for educational purposes with credit to the author.
// Created on December 11, 2024

// This javascript file uses javascript and the jQuery UI to create the 
// gameplay of the Scrabble game. It places the tile data in an array 
// of objects. It uses this data to randomly generate the next tiles
// to be placed on the tile racks, calculate the score, and help display
// the characters on the webpage. However, the most important part is the 
// implementation of the Drag-and-Drop from the jQuery UI to move the tiles 
// between tile rack and board.

$(document).ready(function() {
    const tilesData = {
        "pieces": [
            {"letter": "A", "value": 1, "amount": 9},
            {"letter": "B", "value": 3, "amount": 2},
            {"letter": "C", "value": 3, "amount": 2},
            {"letter": "D", "value": 2, "amount": 4},
            {"letter": "E", "value": 1, "amount": 12},
            {"letter": "F", "value": 4, "amount": 2},
            {"letter": "G", "value": 2, "amount": 3},
            {"letter": "H", "value": 4, "amount": 2},
            {"letter": "I", "value": 1, "amount": 9},
            {"letter": "J", "value": 8, "amount": 1},
            {"letter": "K", "value": 5, "amount": 1},
            {"letter": "L", "value": 1, "amount": 4},
            {"letter": "M", "value": 3, "amount": 2},
            {"letter": "N", "value": 1, "amount": 5},
            {"letter": "O", "value": 1, "amount": 8},
            {"letter": "P", "value": 3, "amount": 2},
            {"letter": "Q", "value": 10, "amount": 1},
            {"letter": "R", "value": 1, "amount": 6},
            {"letter": "S", "value": 1, "amount": 4},
            {"letter": "T", "value": 1, "amount": 6},
            {"letter": "U", "value": 1, "amount": 4},
            {"letter": "V", "value": 4, "amount": 2},
            {"letter": "W", "value": 4, "amount": 2},
            {"letter": "X", "value": 8, "amount": 1},
            {"letter": "Y", "value": 4, "amount": 2},
            {"letter": "Z", "value": 10, "amount": 1}
        ]
    };

    // Highest Score Tracking
    let highestScore = 0;
    $('#highestScore').text(highestScore);

    // Total Tiles Left Tracking
    let tilesLeft = 0;
    tilesData.pieces.forEach(piece => {
        tilesLeft += piece.amount;
    });
    $('#tilesLeft').text(tilesLeft);

    // Function to get random tiles based on tile amount
    function getRandomTiles(numTiles) {
        let availableTiles = [];
        tilesData.pieces.forEach(piece => {
            for (let i = 0; i < piece.amount; i++) {
                availableTiles.push(piece.letter);
            }
        });
        availableTiles = availableTiles.sort(() => Math.random() - 0.5);
        return availableTiles.slice(0, numTiles);
    }

    // Function to render tiles as images in container
    function renderTiles(tiles) {
        const tileContainer = $('.tile-container');
        tileContainer.empty();  // Clear any existing tiles

        tiles.forEach(tile => {
            const imagePath = `images/Scrabble_Tiles/Scrabble_Tile_${tile}.jpg`;
            const tileImage = $('<img>')
                .attr('src', imagePath)
                .attr('alt', tile)
                .addClass('tile')
                .data('letter', tile)
                .data('value', getTileValue(tile))
                .data('placed', false);  // Track if the tile has been placed

            tileContainer.append(tileImage);
        });

        // Reapply draggable after resetting
        $('.tile').draggable({
            revert: 'invalid',
            start: function(event, ui) {
            }
        });
    }

    const getTileValue = (letter) => {
        const tile = tilesData.pieces.find(p => p.letter === letter);
        return tile ? tile.value : 0;
    }

    let totalScore = 0;
    $('#score').text(totalScore);

    // Function to reset game
    function resetGame() {
        totalScore = 0;
        $('#score').text(totalScore);

        // Reset tiles
        const randomTiles = getRandomTiles(7);
        renderTiles(randomTiles);

        // Remove any placed tiles on board
        $('.square').removeClass('occupied');
        
        // Clear displayed letters
        $('#placedLetters').empty();
    }

    // Event listener for reset button
    $('#resetButton').click(function() {
        resetGame();
        toggleNextWordButton();
        highestScore = 0;
        $('#highestScore').text(highestScore);
    });

    // Initialize game with random tiles
    const randomTiles = getRandomTiles(7);
    renderTiles(randomTiles);

    // Make squares droppable
    $('.square').droppable({
        accept: '.tile',
        hoverClass: 'hovered',
        drop: function(event, ui) {
            const tileLetter = ui.helper.data('letter');
            const tileValue = ui.helper.data('value');
            let squareBonus = 1;
            let wordBonus = 1;

            const squareId = $(this).attr('id');

            if (squareId.includes('DW')) {  // Double Word
                wordBonus = 2;
            }
            if (squareId.includes('DL')) {  // Double Letter
                squareBonus = 2;
            }

            let finalTileValue = tileValue * squareBonus;
            totalScore += finalTileValue;
            $('#score').text(totalScore);

            totalScore *= wordBonus;
            $('#score').text(totalScore);

            const imagePath = `images/Scrabble_Tiles/Scrabble_Tile_${tileLetter}.jpg`;

            $(this).addClass('occupied');
            ui.helper.position({
                of: $(this),
                my: 'center',
                at: 'center'
            });

            ui.helper.data('placed', true);

            // Append placed tile's letter to display
            $('#placedLetters').append(`<span class="tile-letter">${tileLetter}</span>`);

            toggleNextWordButton();
        }
    });

    // Allow tiles to be dropped back onto tile rack container
    let tileSpacing = 90;
    $('.tile-container').droppable({
        accept: '.tile',
        drop: function(event, ui) {

            if (ui.helper.data('placed') === false) {
                ui.helper.css({
                    left: 'px',
                    top: '0px'
                });

                return;
            }
 

            const tileValue = ui.helper.data('value');
            totalScore -= tileValue;
            $('#score').text(totalScore);

            ui.helper.css({
                left:'px',
                top: '0px'
            });

            ui.helper.data('placed', false);

            // Remove corresponding letter from displayed text
            const tileLetter = ui.helper.data('letter');
            removeLetterFromDisplay(tileLetter);

            toggleNextWordButton(); // Check if button should be enabled/disabled
        }
    });

    // Function to remove a letter from displayed word
    function removeLetterFromDisplay(letter) {
        // Find first occurrence of letter in the #placedLetters container and remove it
        const letterElements = $('#placedLetters .tile-letter');
        for (let i = 0; i < letterElements.length; i++) {
            if ($(letterElements[i]).text() === letter) {
                $(letterElements[i]).remove();
                break;  // Stop after removing first occurrence
            }
        }
    }

    // Function to toggle "Next Word" button state based on board tiles
    function toggleNextWordButton() {
        const tilesOnBoard = $('.square.occupied').length; // Count placed tiles
        if (tilesOnBoard > 0 && tilesLeft > 0) {
            $('#nextWordButton').prop('disabled', false); // Enable button
        } else {
            $('#nextWordButton').prop('disabled', true); // Disable button
        }
    }

    // "Next Word" button click handler
    $('#nextWordButton').click(function() {
        // Add current score to highest score if higher
        highestScore += totalScore;
        $('#highestScore').text(highestScore);

        // Count how many tiles were used (cleared from the board)
        const tilesUsed = $('.square.occupied').length;

        // Subtract tiles used from total tiles left
        tilesLeft -= tilesUsed;

        // Update tiles left display
        $('#tilesLeft').text(tilesLeft);

        // Clear board and reset game
        resetGame();
    });
});
