
let answer;

window.onload = async () => {
  const { book, chapter, verse } = getRandomVerse();

	answer = getAnswer(book, chapter, verse);

	const localVersicle = getItemUntilNextDay("day-versicle");
	const game = getGame();

	if (!game) {
		setGame(answer, verse);
	} else {
		updateGame(game, answer, versicle);
	}

	generateTries(game.tries, game.won);

  if (!localVersicle) {
    const data = await fetch(
      `https://www.abibliadigital.com.br/api/verses/nvi/${book}/${chapter}/${verse}`,
      {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHIiOiJGcmkgRmViIDE2IDIwMjQgMTk6MTg6MDkgR01UKzAwMDAuNjVjZmI0NzliNDA4OTUwMDI4ZmZjOTlhIiwiaWF0IjoxNzA4MTExMDg5fQ.aiKnMPNwpIpTOqkLFQ2QN9kHaw4rPhqlNmkoiUAXrqs",
        },
      }
    );

		const versicle = await data.json();
		
		restartGame(game, answer, versicle.text);

		setItemUntilNextDay("day-versicle", versicle.text);

    document.getElementById("versicle-text").textContent = `"${versicle.text}"`;
	} else {
		document.getElementById("versicle-text").textContent = `"${localVersicle}"`;
	}

	stopLoading();
};

function generateTries(tries, won) {
	if (tries.length) {
		const rows = document.querySelectorAll(".row");

		rows.forEach((row, index) => {
			if (tries[index]) {
				row.querySelectorAll(".letter").forEach((letter, i) => {
					letter.textContent = tries[index][i];

					letter.setAttribute("style", "animation-duration: 0s");

					if (answer.slice(i, i + 1) === letter.textContent) {
						letter.classList.add("right");
					} else if (answer.includes(letter.textContent)) {
						letter.classList.add("parcial");
					} else {
						letter.classList.add("wrong");
					};
					letter.classList.remove("empty");

					if (tries[index] !== answer) {
						const nextRowLetters = rows[index + 1].querySelectorAll(".letter");
						nextRowLetters.forEach((letter) => letter.classList.add("empty"));
						nextRowLetters[0].classList.add("focus");
					}
				})
			} else if (won) {
				row.querySelectorAll(".letter").forEach((letter, i) => {
					letter.classList.add("disabled");
				});
			}
		})
	}
}

document.body.addEventListener("keyup", (event) => {
	const isNumber = /^\d$/;
	const letters = document.querySelectorAll(".empty");
	const letterIndex = Array.from(letters).findIndex((l) => l.classList.contains("focus"));
	const response = Array.from(letters).map((l) => l.textContent).join("");


	if (event.key === "ArrowRight" && letterIndex < letters.length - 1) {
		letters[letterIndex].classList.remove("focus");
		letters[letterIndex + 1].classList.add("focus");
	}

	if (event.key === "ArrowLeft" && letterIndex > 0 ) {
    letters[letterIndex].classList.remove("focus");
    letters[letterIndex - 1].classList.add("focus");
	}

	if (event.key === "ArrowLeft" && letterIndex === -1) {
    letters[letters.length - 1].classList.add("focus");
	}
	
	if (event.key === "Backspace" && letterIndex > 0 && !letters[letterIndex].textContent) {
		letters[letterIndex].classList.remove("focus");
		letters[letterIndex - 1].classList.add("focus");
    letters[letterIndex - 1].textContent = "";
	}

	if (event.key === "Backspace" && letterIndex === -1) {
    letters[letters.length - 1].textContent = "";
    letters[letters.length - 1].classList.add("focus");
  }
	
	if (event.key === "Backspace" && letterIndex > 0 && letters[letterIndex].textContent) {
		letters[letterIndex].textContent = "";
	}

	if (
		(event.code.includes("Key") || event.code.includes("Digit")) &&
			letterIndex < letters.length &&
			letterIndex !== -1
	) {
		if ((letterIndex >= 2 && isNumber.test(event.key)) || (letterIndex < 2 && !isNumber.test(event.key))) {
			letters[letterIndex].textContent = event.key.toUpperCase();
			letters[letterIndex].classList.remove("focus");

			if (letterIndex < letters.length - 1) {
				letters[letterIndex + 1].classList.add("focus");
			}
		}

	}

	if (event.key === "Enter" && response.length === letters.length) {
		const books = Object.keys(bible).map((abbrv) => abbrv.toUpperCase());
		const book = response.slice(0, 2);

		if (!books.includes(book)) {
			letters.forEach((letter) => {
				letter.parentElement.classList.add("empty-animation");
			});
			setTimeout(() => {
				letters.forEach((letter) => {
					letter.parentElement.classList.remove("empty-animation");
        });
			}, 1000);
			letters.forEach((letter) => letter.textContent = "");
			letters[0].classList.add("focus");
		} else if (response === answer) {
			setTry(response, true);

			let delay = 0;

			letters.forEach((letter, index) => {
        letter.setAttribute("style", `animation-delay: ${delay}s`);
        delay = delay + 0.45;
				letter.classList.add("right");
        letter.classList.remove("empty");
			});
			
			setTimeout(() => {
				letters.forEach((letter) => {
					letter.classList.add("win");
        	letter.removeAttribute("style");
				});
				
				document.querySelectorAll(".letter").forEach((letter) => {
					if (!letter.classList.contains("win")) {
						letter.classList.add("disabled")
					}
				});
				
      }, 450 * letters.length + 100);
		} else {
			setTry(response);

			let delay = 0;

			letters.forEach((letter, index) => {
				letter.setAttribute("style", `animation-delay: ${delay}s`)
				delay = delay + 0.45;
				if (answer.slice(index, index + 1) === letter.textContent) {
					letter.classList.add("right");
				} else if (answer.includes(letter.textContent)) {
					letter.classList.add("parcial");
        } else {
					letter.classList.add("wrong");
        };
				letter.classList.remove("empty");
			})

			setTimeout(() => {
				const nextRowLetters = letters[0].parentElement.nextElementSibling.querySelectorAll(".letter");
				nextRowLetters.forEach((letter) => letter.classList.add("empty"));
				nextRowLetters[0].classList.add("focus");
			}, 450 * letters.length + 100)
		}
	}

	if (event.key === "Enter" && response.length !== letters.length) {
		letters.forEach((letter) => {
			letter.parentElement.classList.add("empty-animation");
			setTimeout(() => {
				letter.parentElement.classList.remove("empty-animation");
			}, 1000)
		})
  }

})

const bible = {
  gn: [
    { chapter: 1, versicles: 31 },
    { chapter: 2, versicles: 25 },
    { chapter: 3, versicles: 24 },
    { chapter: 4, versicles: 26 },
    { chapter: 5, versicles: 32 },
    { chapter: 6, versicles: 22 },
    { chapter: 7, versicles: 24 },
    { chapter: 8, versicles: 22 },
    { chapter: 9, versicles: 29 },
    { chapter: 10, versicles: 32 },
    { chapter: 11, versicles: 32 },
    { chapter: 12, versicles: 20 },
    { chapter: 13, versicles: 18 },
    { chapter: 14, versicles: 24 },
    { chapter: 15, versicles: 21 },
    { chapter: 16, versicles: 16 },
    { chapter: 17, versicles: 27 },
    { chapter: 18, versicles: 33 },
    { chapter: 19, versicles: 38 },
    { chapter: 20, versicles: 18 },
    { chapter: 21, versicles: 34 },
    { chapter: 22, versicles: 24 },
    { chapter: 23, versicles: 20 },
    { chapter: 24, versicles: 67 },
    { chapter: 25, versicles: 34 },
    { chapter: 26, versicles: 35 },
    { chapter: 27, versicles: 46 },
    { chapter: 28, versicles: 22 },
    { chapter: 29, versicles: 35 },
    { chapter: 30, versicles: 43 },
    { chapter: 31, versicles: 55 },
    { chapter: 32, versicles: 32 },
    { chapter: 33, versicles: 20 },
    { chapter: 34, versicles: 31 },
    { chapter: 35, versicles: 29 },
    { chapter: 36, versicles: 43 },
    { chapter: 37, versicles: 36 },
    { chapter: 38, versicles: 30 },
    { chapter: 39, versicles: 23 },
    { chapter: 40, versicles: 23 },
    { chapter: 41, versicles: 57 },
    { chapter: 42, versicles: 38 },
    { chapter: 43, versicles: 34 },
    { chapter: 44, versicles: 34 },
    { chapter: 45, versicles: 28 },
    { chapter: 46, versicles: 34 },
    { chapter: 47, versicles: 31 },
    { chapter: 48, versicles: 22 },
    { chapter: 49, versicles: 33 },
    { chapter: 50, versicles: 26 },
  ],
  ex: [
    { chapter: 1, versicles: 22 },
    { chapter: 2, versicles: 25 },
    { chapter: 3, versicles: 22 },
    { chapter: 4, versicles: 31 },
    { chapter: 5, versicles: 23 },
    { chapter: 6, versicles: 30 },
    { chapter: 7, versicles: 25 },
    { chapter: 8, versicles: 32 },
    { chapter: 9, versicles: 35 },
    { chapter: 10, versicles: 29 },
    { chapter: 11, versicles: 10 },
    { chapter: 12, versicles: 51 },
    { chapter: 13, versicles: 22 },
    { chapter: 14, versicles: 31 },
    { chapter: 15, versicles: 27 },
    { chapter: 16, versicles: 36 },
    { chapter: 17, versicles: 16 },
    { chapter: 18, versicles: 27 },
    { chapter: 19, versicles: 25 },
    { chapter: 20, versicles: 26 },
    { chapter: 21, versicles: 36 },
    { chapter: 22, versicles: 31 },
    { chapter: 23, versicles: 33 },
    { chapter: 24, versicles: 18 },
    { chapter: 25, versicles: 40 },
    { chapter: 26, versicles: 37 },
    { chapter: 27, versicles: 21 },
    { chapter: 28, versicles: 43 },
    { chapter: 29, versicles: 46 },
    { chapter: 30, versicles: 38 },
    { chapter: 31, versicles: 18 },
    { chapter: 32, versicles: 35 },
    { chapter: 33, versicles: 23 },
    { chapter: 34, versicles: 35 },
    { chapter: 35, versicles: 35 },
    { chapter: 36, versicles: 38 },
    { chapter: 37, versicles: 29 },
    { chapter: 38, versicles: 31 },
    { chapter: 39, versicles: 43 },
    { chapter: 40, versicles: 38 },
  ],
  lv: [
    { chapter: 1, versicles: 17 },
    { chapter: 2, versicles: 16 },
    { chapter: 3, versicles: 17 },
    { chapter: 4, versicles: 35 },
    { chapter: 5, versicles: 19 },
    { chapter: 6, versicles: 30 },
    { chapter: 7, versicles: 38 },
    { chapter: 8, versicles: 36 },
    { chapter: 9, versicles: 24 },
    { chapter: 10, versicles: 20 },
    { chapter: 11, versicles: 47 },
    { chapter: 12, versicles: 8 },
    { chapter: 13, versicles: 59 },
    { chapter: 14, versicles: 57 },
    { chapter: 15, versicles: 33 },
    { chapter: 16, versicles: 34 },
    { chapter: 17, versicles: 16 },
    { chapter: 18, versicles: 30 },
    { chapter: 19, versicles: 37 },
    { chapter: 20, versicles: 27 },
    { chapter: 21, versicles: 24 },
    { chapter: 22, versicles: 33 },
    { chapter: 23, versicles: 44 },
    { chapter: 24, versicles: 23 },
    { chapter: 25, versicles: 55 },
    { chapter: 26, versicles: 46 },
    { chapter: 27, versicles: 34 },
  ],
  nm: [
    { chapter: 1, versicles: 54 },
    { chapter: 2, versicles: 34 },
    { chapter: 3, versicles: 51 },
    { chapter: 4, versicles: 49 },
    { chapter: 5, versicles: 31 },
    { chapter: 6, versicles: 27 },
    { chapter: 7, versicles: 89 },
    { chapter: 8, versicles: 26 },
    { chapter: 9, versicles: 23 },
    { chapter: 10, versicles: 36 },
    { chapter: 11, versicles: 35 },
    { chapter: 12, versicles: 16 },
    { chapter: 13, versicles: 33 },
    { chapter: 14, versicles: 45 },
    { chapter: 15, versicles: 41 },
    { chapter: 16, versicles: 50 },
    { chapter: 17, versicles: 13 },
    { chapter: 18, versicles: 32 },
    { chapter: 19, versicles: 22 },
    { chapter: 20, versicles: 29 },
    { chapter: 21, versicles: 35 },
    { chapter: 22, versicles: 41 },
    { chapter: 23, versicles: 30 },
    { chapter: 24, versicles: 25 },
    { chapter: 25, versicles: 18 },
    { chapter: 26, versicles: 65 },
    { chapter: 27, versicles: 23 },
    { chapter: 28, versicles: 31 },
    { chapter: 29, versicles: 40 },
    { chapter: 30, versicles: 16 },
    { chapter: 31, versicles: 54 },
    { chapter: 32, versicles: 42 },
    { chapter: 33, versicles: 56 },
    { chapter: 34, versicles: 29 },
    { chapter: 35, versicles: 34 },
    { chapter: 36, versicles: 13 },
  ],
  dt: [
    { chapter: 1, versicles: 46 },
    { chapter: 2, versicles: 37 },
    { chapter: 3, versicles: 29 },
    { chapter: 4, versicles: 49 },
    { chapter: 5, versicles: 33 },
    { chapter: 6, versicles: 25 },
    { chapter: 7, versicles: 26 },
    { chapter: 8, versicles: 20 },
    { chapter: 9, versicles: 29 },
    { chapter: 10, versicles: 22 },
    { chapter: 11, versicles: 32 },
    { chapter: 12, versicles: 32 },
    { chapter: 13, versicles: 18 },
    { chapter: 14, versicles: 29 },
    { chapter: 15, versicles: 23 },
    { chapter: 16, versicles: 22 },
    { chapter: 17, versicles: 20 },
    { chapter: 18, versicles: 22 },
    { chapter: 19, versicles: 21 },
    { chapter: 20, versicles: 20 },
    { chapter: 21, versicles: 23 },
    { chapter: 22, versicles: 30 },
    { chapter: 23, versicles: 25 },
    { chapter: 24, versicles: 22 },
    { chapter: 25, versicles: 19 },
    { chapter: 26, versicles: 19 },
    { chapter: 27, versicles: 26 },
    { chapter: 28, versicles: 68 },
    { chapter: 29, versicles: 29 },
    { chapter: 30, versicles: 20 },
    { chapter: 31, versicles: 30 },
    { chapter: 32, versicles: 52 },
    { chapter: 33, versicles: 29 },
    { chapter: 34, versicles: 12 },
  ],
  js: [
    { chapter: 1, versicles: 18 },
    { chapter: 2, versicles: 24 },
    { chapter: 3, versicles: 17 },
    { chapter: 4, versicles: 24 },
    { chapter: 5, versicles: 15 },
    { chapter: 6, versicles: 27 },
    { chapter: 7, versicles: 26 },
    { chapter: 8, versicles: 35 },
    { chapter: 9, versicles: 27 },
    { chapter: 10, versicles: 43 },
    { chapter: 11, versicles: 23 },
    { chapter: 12, versicles: 24 },
    { chapter: 13, versicles: 33 },
    { chapter: 14, versicles: 15 },
    { chapter: 15, versicles: 63 },
    { chapter: 16, versicles: 10 },
    { chapter: 17, versicles: 18 },
    { chapter: 18, versicles: 28 },
    { chapter: 19, versicles: 51 },
    { chapter: 20, versicles: 9 },
    { chapter: 21, versicles: 45 },
    { chapter: 22, versicles: 34 },
    { chapter: 23, versicles: 16 },
    { chapter: 24, versicles: 33 },
  ],
  jz: [
    { chapter: 1, versicles: 36 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 31 },
    { chapter: 4, versicles: 24 },
    { chapter: 5, versicles: 31 },
    { chapter: 6, versicles: 40 },
    { chapter: 7, versicles: 25 },
    { chapter: 8, versicles: 35 },
    { chapter: 9, versicles: 57 },
    { chapter: 10, versicles: 18 },
    { chapter: 11, versicles: 40 },
    { chapter: 12, versicles: 15 },
    { chapter: 13, versicles: 25 },
    { chapter: 14, versicles: 20 },
    { chapter: 15, versicles: 20 },
    { chapter: 16, versicles: 31 },
    { chapter: 17, versicles: 13 },
    { chapter: 18, versicles: 31 },
    { chapter: 19, versicles: 30 },
    { chapter: 20, versicles: 48 },
    { chapter: 21, versicles: 25 },
  ],
  rt: [
    { chapter: 1, versicles: 22 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 18 },
    { chapter: 4, versicles: 22 },
  ],
  // "1sm": [
  //   { chapter: 1, versicles: 28 },
  //   { chapter: 2, versicles: 36 },
  //   { chapter: 3, versicles: 21 },
  //   { chapter: 4, versicles: 22 },
  //   { chapter: 5, versicles: 12 },
  //   { chapter: 6, versicles: 21 },
  //   { chapter: 7, versicles: 17 },
  //   { chapter: 8, versicles: 22 },
  //   { chapter: 9, versicles: 27 },
  //   { chapter: 10, versicles: 27 },
  //   { chapter: 11, versicles: 15 },
  //   { chapter: 12, versicles: 25 },
  //   { chapter: 13, versicles: 23 },
  //   { chapter: 14, versicles: 52 },
  //   { chapter: 15, versicles: 35 },
  //   { chapter: 16, versicles: 23 },
  //   { chapter: 17, versicles: 58 },
  //   { chapter: 18, versicles: 30 },
  //   { chapter: 19, versicles: 24 },
  //   { chapter: 20, versicles: 43 },
  //   { chapter: 21, versicles: 15 },
  //   { chapter: 22, versicles: 23 },
  //   { chapter: 23, versicles: 29 },
  //   { chapter: 24, versicles: 22 },
  //   { chapter: 25, versicles: 44 },
  //   { chapter: 26, versicles: 25 },
  //   { chapter: 27, versicles: 12 },
  //   { chapter: 28, versicles: 25 },
  //   { chapter: 29, versicles: 11 },
  //   { chapter: 30, versicles: 31 },
  //   { chapter: 31, versicles: 13 },
  // ],
  // "2sm": [
  //   { chapter: 1, versicles: 27 },
  //   { chapter: 2, versicles: 32 },
  //   { chapter: 3, versicles: 39 },
  //   { chapter: 4, versicles: 12 },
  //   { chapter: 5, versicles: 25 },
  //   { chapter: 6, versicles: 23 },
  //   { chapter: 7, versicles: 29 },
  //   { chapter: 8, versicles: 18 },
  //   { chapter: 9, versicles: 13 },
  //   { chapter: 10, versicles: 19 },
  //   { chapter: 11, versicles: 27 },
  //   { chapter: 12, versicles: 31 },
  //   { chapter: 13, versicles: 39 },
  //   { chapter: 14, versicles: 33 },
  //   { chapter: 15, versicles: 37 },
  //   { chapter: 16, versicles: 23 },
  //   { chapter: 17, versicles: 29 },
  //   { chapter: 18, versicles: 33 },
  //   { chapter: 19, versicles: 43 },
  //   { chapter: 20, versicles: 26 },
  //   { chapter: 21, versicles: 22 },
  //   { chapter: 22, versicles: 51 },
  //   { chapter: 23, versicles: 39 },
  //   { chapter: 24, versicles: 25 },
  // ],
  // "1rs": [
  //   { chapter: 1, versicles: 53 },
  //   { chapter: 2, versicles: 46 },
  //   { chapter: 3, versicles: 28 },
  //   { chapter: 4, versicles: 34 },
  //   { chapter: 5, versicles: 18 },
  //   { chapter: 6, versicles: 38 },
  //   { chapter: 7, versicles: 51 },
  //   { chapter: 8, versicles: 66 },
  //   { chapter: 9, versicles: 28 },
  //   { chapter: 10, versicles: 29 },
  //   { chapter: 11, versicles: 43 },
  //   { chapter: 12, versicles: 33 },
  //   { chapter: 13, versicles: 34 },
  //   { chapter: 14, versicles: 31 },
  //   { chapter: 15, versicles: 34 },
  //   { chapter: 16, versicles: 34 },
  //   { chapter: 17, versicles: 24 },
  //   { chapter: 18, versicles: 46 },
  //   { chapter: 19, versicles: 21 },
  //   { chapter: 20, versicles: 43 },
  //   { chapter: 21, versicles: 29 },
  //   { chapter: 22, versicles: 53 },
  // ],
  // "2rs": [
  //   { chapter: 1, versicles: 18 },
  //   { chapter: 2, versicles: 25 },
  //   { chapter: 3, versicles: 27 },
  //   { chapter: 4, versicles: 44 },
  //   { chapter: 5, versicles: 27 },
  //   { chapter: 6, versicles: 33 },
  //   { chapter: 7, versicles: 20 },
  //   { chapter: 8, versicles: 29 },
  //   { chapter: 9, versicles: 37 },
  //   { chapter: 10, versicles: 36 },
  //   { chapter: 11, versicles: 21 },
  //   { chapter: 12, versicles: 21 },
  //   { chapter: 13, versicles: 25 },
  //   { chapter: 14, versicles: 29 },
  //   { chapter: 15, versicles: 38 },
  //   { chapter: 16, versicles: 20 },
  //   { chapter: 17, versicles: 41 },
  //   { chapter: 18, versicles: 37 },
  //   { chapter: 19, versicles: 37 },
  //   { chapter: 20, versicles: 21 },
  //   { chapter: 21, versicles: 26 },
  //   { chapter: 22, versicles: 20 },
  //   { chapter: 23, versicles: 37 },
  //   { chapter: 24, versicles: 20 },
  //   { chapter: 25, versicles: 30 },
  // ],
  // "1cr": [
  //   { chapter: 1, versicles: 54 },
  //   { chapter: 2, versicles: 55 },
  //   { chapter: 3, versicles: 24 },
  //   { chapter: 4, versicles: 43 },
  //   { chapter: 5, versicles: 26 },
  //   { chapter: 6, versicles: 81 },
  //   { chapter: 7, versicles: 40 },
  //   { chapter: 8, versicles: 40 },
  //   { chapter: 9, versicles: 44 },
  //   { chapter: 10, versicles: 14 },
  //   { chapter: 11, versicles: 47 },
  //   { chapter: 12, versicles: 40 },
  //   { chapter: 13, versicles: 14 },
  //   { chapter: 14, versicles: 17 },
  //   { chapter: 15, versicles: 29 },
  //   { chapter: 16, versicles: 43 },
  //   { chapter: 17, versicles: 27 },
  //   { chapter: 18, versicles: 17 },
  //   { chapter: 19, versicles: 19 },
  //   { chapter: 20, versicles: 8 },
  //   { chapter: 21, versicles: 30 },
  //   { chapter: 22, versicles: 19 },
  //   { chapter: 23, versicles: 32 },
  //   { chapter: 24, versicles: 31 },
  //   { chapter: 25, versicles: 31 },
  //   { chapter: 26, versicles: 32 },
  //   { chapter: 27, versicles: 34 },
  //   { chapter: 28, versicles: 21 },
  //   { chapter: 29, versicles: 30 },
  // ],
  // "2cr": [
  //   { chapter: 1, versicles: 17 },
  //   { chapter: 2, versicles: 18 },
  //   { chapter: 3, versicles: 17 },
  //   { chapter: 4, versicles: 22 },
  //   { chapter: 5, versicles: 14 },
  //   { chapter: 6, versicles: 42 },
  //   { chapter: 7, versicles: 22 },
  //   { chapter: 8, versicles: 18 },
  //   { chapter: 9, versicles: 31 },
  //   { chapter: 10, versicles: 19 },
  //   { chapter: 11, versicles: 23 },
  //   { chapter: 12, versicles: 16 },
  //   { chapter: 13, versicles: 22 },
  //   { chapter: 14, versicles: 15 },
  //   { chapter: 15, versicles: 19 },
  //   { chapter: 16, versicles: 14 },
  //   { chapter: 17, versicles: 19 },
  //   { chapter: 18, versicles: 34 },
  //   { chapter: 19, versicles: 11 },
  //   { chapter: 20, versicles: 37 },
  //   { chapter: 21, versicles: 20 },
  //   { chapter: 22, versicles: 12 },
  //   { chapter: 23, versicles: 21 },
  //   { chapter: 24, versicles: 27 },
  //   { chapter: 25, versicles: 28 },
  //   { chapter: 26, versicles: 23 },
  //   { chapter: 27, versicles: 9 },
  //   { chapter: 28, versicles: 27 },
  //   { chapter: 29, versicles: 36 },
  //   { chapter: 30, versicles: 27 },
  //   { chapter: 31, versicles: 21 },
  //   { chapter: 32, versicles: 33 },
  //   { chapter: 33, versicles: 25 },
  //   { chapter: 34, versicles: 33 },
  //   { chapter: 35, versicles: 27 },
  //   { chapter: 36, versicles: 23 },
  // ],
  ed: [
    { chapter: 1, versicles: 11 },
    { chapter: 2, versicles: 70 },
    { chapter: 3, versicles: 13 },
    { chapter: 4, versicles: 24 },
    { chapter: 5, versicles: 17 },
    { chapter: 6, versicles: 22 },
    { chapter: 7, versicles: 28 },
    { chapter: 8, versicles: 36 },
    { chapter: 9, versicles: 15 },
    { chapter: 10, versicles: 44 },
  ],
  ne: [
    { chapter: 1, versicles: 11 },
    { chapter: 2, versicles: 20 },
    { chapter: 3, versicles: 32 },
    { chapter: 4, versicles: 23 },
    { chapter: 5, versicles: 19 },
    { chapter: 6, versicles: 19 },
    { chapter: 7, versicles: 73 },
    { chapter: 8, versicles: 18 },
    { chapter: 9, versicles: 38 },
    { chapter: 10, versicles: 39 },
    { chapter: 11, versicles: 36 },
    { chapter: 12, versicles: 47 },
    { chapter: 13, versicles: 31 },
  ],
  et: [
    { chapter: 1, versicles: 22 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 15 },
    { chapter: 4, versicles: 17 },
    { chapter: 5, versicles: 14 },
    { chapter: 6, versicles: 14 },
    { chapter: 7, versicles: 10 },
    { chapter: 8, versicles: 17 },
    { chapter: 9, versicles: 32 },
    { chapter: 10, versicles: 3 },
  ],
  // job: [
  //   { chapter: 1, versicles: 22 },
  //   { chapter: 2, versicles: 13 },
  //   { chapter: 3, versicles: 26 },
  //   { chapter: 4, versicles: 21 },
  //   { chapter: 5, versicles: 27 },
  //   { chapter: 6, versicles: 30 },
  //   { chapter: 7, versicles: 21 },
  //   { chapter: 8, versicles: 22 },
  //   { chapter: 9, versicles: 35 },
  //   { chapter: 10, versicles: 22 },
  //   { chapter: 11, versicles: 20 },
  //   { chapter: 12, versicles: 25 },
  //   { chapter: 13, versicles: 28 },
  //   { chapter: 14, versicles: 22 },
  //   { chapter: 15, versicles: 35 },
  //   { chapter: 16, versicles: 22 },
  //   { chapter: 17, versicles: 16 },
  //   { chapter: 18, versicles: 21 },
  //   { chapter: 19, versicles: 29 },
  //   { chapter: 20, versicles: 29 },
  //   { chapter: 21, versicles: 34 },
  //   { chapter: 22, versicles: 30 },
  //   { chapter: 23, versicles: 17 },
  //   { chapter: 24, versicles: 25 },
  //   { chapter: 25, versicles: 6 },
  //   { chapter: 26, versicles: 14 },
  //   { chapter: 27, versicles: 23 },
  //   { chapter: 28, versicles: 28 },
  //   { chapter: 29, versicles: 25 },
  //   { chapter: 30, versicles: 31 },
  //   { chapter: 31, versicles: 40 },
  //   { chapter: 32, versicles: 22 },
  //   { chapter: 33, versicles: 33 },
  //   { chapter: 34, versicles: 37 },
  //   { chapter: 35, versicles: 16 },
  //   { chapter: 36, versicles: 33 },
  //   { chapter: 37, versicles: 24 },
  //   { chapter: 38, versicles: 41 },
  //   { chapter: 39, versicles: 30 },
  //   { chapter: 40, versicles: 24 },
  //   { chapter: 41, versicles: 34 },
  //   { chapter: 42, versicles: 17 },
  // ],
  sl: [
    { chapter: 1, versicles: 6 },
    { chapter: 2, versicles: 12 },
    { chapter: 3, versicles: 8 },
    { chapter: 4, versicles: 8 },
    { chapter: 5, versicles: 12 },
    { chapter: 6, versicles: 10 },
    { chapter: 7, versicles: 17 },
    { chapter: 8, versicles: 9 },
    { chapter: 9, versicles: 20 },
    { chapter: 10, versicles: 18 },
    { chapter: 11, versicles: 7 },
    { chapter: 12, versicles: 8 },
    { chapter: 13, versicles: 6 },
    { chapter: 14, versicles: 7 },
    { chapter: 15, versicles: 5 },
    { chapter: 16, versicles: 11 },
    { chapter: 17, versicles: 15 },
    { chapter: 18, versicles: 50 },
    { chapter: 19, versicles: 14 },
    { chapter: 20, versicles: 9 },
    { chapter: 21, versicles: 13 },
    { chapter: 22, versicles: 31 },
    { chapter: 23, versicles: 6 },
    { chapter: 24, versicles: 10 },
    { chapter: 25, versicles: 22 },
    { chapter: 26, versicles: 12 },
    { chapter: 27, versicles: 14 },
    { chapter: 28, versicles: 9 },
    { chapter: 29, versicles: 11 },
    { chapter: 30, versicles: 12 },
    { chapter: 31, versicles: 24 },
    { chapter: 32, versicles: 11 },
    { chapter: 33, versicles: 22 },
    { chapter: 34, versicles: 22 },
    { chapter: 35, versicles: 28 },
    { chapter: 36, versicles: 12 },
    { chapter: 37, versicles: 40 },
    { chapter: 38, versicles: 22 },
    { chapter: 39, versicles: 13 },
    { chapter: 40, versicles: 17 },
    { chapter: 41, versicles: 13 },
    { chapter: 42, versicles: 11 },
    { chapter: 43, versicles: 5 },
    { chapter: 44, versicles: 26 },
    { chapter: 45, versicles: 17 },
    { chapter: 46, versicles: 11 },
    { chapter: 47, versicles: 9 },
    { chapter: 48, versicles: 14 },
    { chapter: 49, versicles: 20 },
    { chapter: 50, versicles: 23 },
    { chapter: 51, versicles: 19 },
    { chapter: 52, versicles: 9 },
    { chapter: 53, versicles: 6 },
    { chapter: 54, versicles: 7 },
    { chapter: 55, versicles: 23 },
    { chapter: 56, versicles: 13 },
    { chapter: 57, versicles: 11 },
    { chapter: 58, versicles: 11 },
    { chapter: 59, versicles: 17 },
    { chapter: 60, versicles: 12 },
    { chapter: 61, versicles: 8 },
    { chapter: 62, versicles: 12 },
    { chapter: 63, versicles: 11 },
    { chapter: 64, versicles: 10 },
    { chapter: 65, versicles: 13 },
    { chapter: 66, versicles: 20 },
    { chapter: 67, versicles: 7 },
    { chapter: 68, versicles: 35 },
    { chapter: 69, versicles: 36 },
    { chapter: 70, versicles: 5 },
    { chapter: 71, versicles: 24 },
    { chapter: 72, versicles: 20 },
    { chapter: 73, versicles: 28 },
    { chapter: 74, versicles: 23 },
    { chapter: 75, versicles: 10 },
    { chapter: 76, versicles: 12 },
    { chapter: 77, versicles: 20 },
    { chapter: 78, versicles: 72 },
    { chapter: 79, versicles: 13 },
    { chapter: 80, versicles: 19 },
    { chapter: 81, versicles: 16 },
    { chapter: 82, versicles: 8 },
    { chapter: 83, versicles: 18 },
    { chapter: 84, versicles: 12 },
    { chapter: 85, versicles: 13 },
    { chapter: 86, versicles: 17 },
    { chapter: 87, versicles: 7 },
    { chapter: 88, versicles: 18 },
    { chapter: 89, versicles: 52 },
    { chapter: 90, versicles: 17 },
    { chapter: 91, versicles: 16 },
    { chapter: 92, versicles: 15 },
    { chapter: 93, versicles: 5 },
    { chapter: 94, versicles: 23 },
    { chapter: 95, versicles: 11 },
    { chapter: 96, versicles: 13 },
    { chapter: 97, versicles: 12 },
    { chapter: 98, versicles: 9 },
    { chapter: 99, versicles: 9 },
    { chapter: 100, versicles: 5 },
    { chapter: 101, versicles: 8 },
    { chapter: 102, versicles: 28 },
    { chapter: 103, versicles: 22 },
    { chapter: 104, versicles: 35 },
    { chapter: 105, versicles: 45 },
    { chapter: 106, versicles: 48 },
    { chapter: 107, versicles: 43 },
    { chapter: 108, versicles: 13 },
    { chapter: 109, versicles: 31 },
    { chapter: 110, versicles: 7 },
    { chapter: 111, versicles: 10 },
    { chapter: 112, versicles: 10 },
    { chapter: 113, versicles: 9 },
    { chapter: 114, versicles: 8 },
    { chapter: 115, versicles: 18 },
    { chapter: 116, versicles: 19 },
    { chapter: 117, versicles: 2 },
    { chapter: 118, versicles: 29 },
    { chapter: 119, versicles: 176 },
    { chapter: 120, versicles: 7 },
    { chapter: 121, versicles: 8 },
    { chapter: 122, versicles: 9 },
    { chapter: 123, versicles: 4 },
    { chapter: 124, versicles: 8 },
    { chapter: 125, versicles: 5 },
    { chapter: 126, versicles: 6 },
    { chapter: 127, versicles: 5 },
    { chapter: 128, versicles: 6 },
    { chapter: 129, versicles: 8 },
    { chapter: 130, versicles: 8 },
    { chapter: 131, versicles: 3 },
    { chapter: 132, versicles: 18 },
    { chapter: 133, versicles: 3 },
    { chapter: 134, versicles: 3 },
    { chapter: 135, versicles: 21 },
    { chapter: 136, versicles: 26 },
    { chapter: 137, versicles: 9 },
    { chapter: 138, versicles: 8 },
    { chapter: 139, versicles: 24 },
    { chapter: 140, versicles: 13 },
    { chapter: 141, versicles: 10 },
    { chapter: 142, versicles: 7 },
    { chapter: 143, versicles: 12 },
    { chapter: 144, versicles: 15 },
    { chapter: 145, versicles: 21 },
    { chapter: 146, versicles: 10 },
    { chapter: 147, versicles: 20 },
    { chapter: 148, versicles: 14 },
    { chapter: 149, versicles: 9 },
    { chapter: 150, versicles: 6 },
  ],
  pv: [
    { chapter: 1, versicles: 33 },
    { chapter: 2, versicles: 22 },
    { chapter: 3, versicles: 35 },
    { chapter: 4, versicles: 27 },
    { chapter: 5, versicles: 23 },
    { chapter: 6, versicles: 35 },
    { chapter: 7, versicles: 27 },
    { chapter: 8, versicles: 36 },
    { chapter: 9, versicles: 18 },
    { chapter: 10, versicles: 32 },
    { chapter: 11, versicles: 31 },
    { chapter: 12, versicles: 28 },
    { chapter: 13, versicles: 25 },
    { chapter: 14, versicles: 35 },
    { chapter: 15, versicles: 33 },
    { chapter: 16, versicles: 33 },
    { chapter: 17, versicles: 28 },
    { chapter: 18, versicles: 24 },
    { chapter: 19, versicles: 29 },
    { chapter: 20, versicles: 30 },
    { chapter: 21, versicles: 31 },
    { chapter: 22, versicles: 29 },
    { chapter: 23, versicles: 35 },
    { chapter: 24, versicles: 34 },
    { chapter: 25, versicles: 28 },
    { chapter: 26, versicles: 28 },
    { chapter: 27, versicles: 27 },
    { chapter: 28, versicles: 28 },
    { chapter: 29, versicles: 27 },
    { chapter: 30, versicles: 33 },
    { chapter: 31, versicles: 31 },
  ],
  ec: [
    { chapter: 1, versicles: 18 },
    { chapter: 2, versicles: 26 },
    { chapter: 3, versicles: 22 },
    { chapter: 4, versicles: 16 },
    { chapter: 5, versicles: 20 },
    { chapter: 6, versicles: 12 },
    { chapter: 7, versicles: 29 },
    { chapter: 8, versicles: 17 },
    { chapter: 9, versicles: 18 },
    { chapter: 10, versicles: 20 },
    { chapter: 11, versicles: 10 },
    { chapter: 12, versicles: 14 },
  ],
  ct: [
    { chapter: 1, versicles: 17 },
    { chapter: 2, versicles: 17 },
    { chapter: 3, versicles: 11 },
    { chapter: 4, versicles: 16 },
    { chapter: 5, versicles: 16 },
    { chapter: 6, versicles: 13 },
    { chapter: 7, versicles: 13 },
    { chapter: 8, versicles: 14 },
  ],
  is: [
    { chapter: 1, versicles: 31 },
    { chapter: 2, versicles: 22 },
    { chapter: 3, versicles: 26 },
    { chapter: 4, versicles: 6 },
    { chapter: 5, versicles: 30 },
    { chapter: 6, versicles: 13 },
    { chapter: 7, versicles: 25 },
    { chapter: 8, versicles: 22 },
    { chapter: 9, versicles: 21 },
    { chapter: 10, versicles: 34 },
    { chapter: 11, versicles: 16 },
    { chapter: 12, versicles: 6 },
    { chapter: 13, versicles: 22 },
    { chapter: 14, versicles: 32 },
    { chapter: 15, versicles: 9 },
    { chapter: 16, versicles: 14 },
    { chapter: 17, versicles: 14 },
    { chapter: 18, versicles: 7 },
    { chapter: 19, versicles: 25 },
    { chapter: 20, versicles: 6 },
    { chapter: 21, versicles: 17 },
    { chapter: 22, versicles: 25 },
    { chapter: 23, versicles: 18 },
    { chapter: 24, versicles: 23 },
    { chapter: 25, versicles: 12 },
    { chapter: 26, versicles: 21 },
    { chapter: 27, versicles: 13 },
    { chapter: 28, versicles: 29 },
    { chapter: 29, versicles: 24 },
    { chapter: 30, versicles: 33 },
    { chapter: 31, versicles: 9 },
    { chapter: 32, versicles: 20 },
    { chapter: 33, versicles: 24 },
    { chapter: 34, versicles: 17 },
    { chapter: 35, versicles: 10 },
    { chapter: 36, versicles: 22 },
    { chapter: 37, versicles: 38 },
    { chapter: 38, versicles: 22 },
    { chapter: 39, versicles: 8 },
    { chapter: 40, versicles: 31 },
    { chapter: 41, versicles: 29 },
    { chapter: 42, versicles: 25 },
    { chapter: 43, versicles: 28 },
    { chapter: 44, versicles: 28 },
    { chapter: 45, versicles: 25 },
    { chapter: 46, versicles: 13 },
    { chapter: 47, versicles: 15 },
    { chapter: 48, versicles: 22 },
    { chapter: 49, versicles: 26 },
    { chapter: 50, versicles: 11 },
    { chapter: 51, versicles: 23 },
    { chapter: 52, versicles: 15 },
    { chapter: 53, versicles: 12 },
    { chapter: 54, versicles: 17 },
    { chapter: 55, versicles: 13 },
    { chapter: 56, versicles: 12 },
    { chapter: 57, versicles: 21 },
    { chapter: 58, versicles: 14 },
    { chapter: 59, versicles: 21 },
    { chapter: 60, versicles: 22 },
    { chapter: 61, versicles: 11 },
    { chapter: 62, versicles: 12 },
    { chapter: 63, versicles: 19 },
    { chapter: 64, versicles: 12 },
    { chapter: 65, versicles: 25 },
    { chapter: 66, versicles: 24 },
  ],
  jr: [
    { chapter: 1, versicles: 19 },
    { chapter: 2, versicles: 37 },
    { chapter: 3, versicles: 25 },
    { chapter: 4, versicles: 31 },
    { chapter: 5, versicles: 31 },
    { chapter: 6, versicles: 30 },
    { chapter: 7, versicles: 34 },
    { chapter: 8, versicles: 22 },
    { chapter: 9, versicles: 26 },
    { chapter: 10, versicles: 25 },
    { chapter: 11, versicles: 23 },
    { chapter: 12, versicles: 17 },
    { chapter: 13, versicles: 27 },
    { chapter: 14, versicles: 22 },
    { chapter: 15, versicles: 21 },
    { chapter: 16, versicles: 21 },
    { chapter: 17, versicles: 27 },
    { chapter: 18, versicles: 23 },
    { chapter: 19, versicles: 15 },
    { chapter: 20, versicles: 18 },
    { chapter: 21, versicles: 14 },
    { chapter: 22, versicles: 30 },
    { chapter: 23, versicles: 40 },
    { chapter: 24, versicles: 10 },
    { chapter: 25, versicles: 38 },
    { chapter: 26, versicles: 24 },
    { chapter: 27, versicles: 22 },
    { chapter: 28, versicles: 17 },
    { chapter: 29, versicles: 32 },
    { chapter: 30, versicles: 24 },
    { chapter: 31, versicles: 40 },
    { chapter: 32, versicles: 44 },
    { chapter: 33, versicles: 26 },
    { chapter: 34, versicles: 22 },
    { chapter: 35, versicles: 19 },
    { chapter: 36, versicles: 32 },
    { chapter: 37, versicles: 21 },
    { chapter: 38, versicles: 28 },
    { chapter: 39, versicles: 18 },
    { chapter: 40, versicles: 16 },
    { chapter: 41, versicles: 18 },
    { chapter: 42, versicles: 22 },
    { chapter: 43, versicles: 13 },
    { chapter: 44, versicles: 30 },
    { chapter: 45, versicles: 5 },
    { chapter: 46, versicles: 28 },
    { chapter: 47, versicles: 7 },
    { chapter: 48, versicles: 47 },
    { chapter: 49, versicles: 39 },
    { chapter: 50, versicles: 46 },
    { chapter: 51, versicles: 64 },
    { chapter: 52, versicles: 34 },
  ],
  lm: [
    { chapter: 1, versicles: 22 },
    { chapter: 2, versicles: 22 },
    { chapter: 3, versicles: 66 },
    { chapter: 4, versicles: 22 },
    { chapter: 5, versicles: 22 },
  ],
  ez: [
    { chapter: 1, versicles: 28 },
    { chapter: 2, versicles: 10 },
    { chapter: 3, versicles: 27 },
    { chapter: 4, versicles: 17 },
    { chapter: 5, versicles: 17 },
    { chapter: 6, versicles: 14 },
    { chapter: 7, versicles: 27 },
    { chapter: 8, versicles: 18 },
    { chapter: 9, versicles: 11 },
    { chapter: 10, versicles: 22 },
    { chapter: 11, versicles: 25 },
    { chapter: 12, versicles: 28 },
    { chapter: 13, versicles: 23 },
    { chapter: 14, versicles: 23 },
    { chapter: 15, versicles: 8 },
    { chapter: 16, versicles: 63 },
    { chapter: 17, versicles: 24 },
    { chapter: 18, versicles: 32 },
    { chapter: 19, versicles: 14 },
    { chapter: 20, versicles: 49 },
    { chapter: 21, versicles: 32 },
    { chapter: 22, versicles: 31 },
    { chapter: 23, versicles: 49 },
    { chapter: 24, versicles: 27 },
    { chapter: 25, versicles: 17 },
    { chapter: 26, versicles: 21 },
    { chapter: 27, versicles: 36 },
    { chapter: 28, versicles: 26 },
    { chapter: 29, versicles: 21 },
    { chapter: 30, versicles: 26 },
    { chapter: 31, versicles: 18 },
    { chapter: 32, versicles: 32 },
    { chapter: 33, versicles: 33 },
    { chapter: 34, versicles: 31 },
    { chapter: 35, versicles: 15 },
    { chapter: 36, versicles: 38 },
    { chapter: 37, versicles: 28 },
    { chapter: 38, versicles: 23 },
    { chapter: 39, versicles: 29 },
    { chapter: 40, versicles: 49 },
    { chapter: 41, versicles: 26 },
    { chapter: 42, versicles: 20 },
    { chapter: 43, versicles: 27 },
    { chapter: 44, versicles: 31 },
    { chapter: 45, versicles: 25 },
    { chapter: 46, versicles: 24 },
    { chapter: 47, versicles: 23 },
    { chapter: 48, versicles: 35 },
  ],
  dn: [
    { chapter: 1, versicles: 21 },
    { chapter: 2, versicles: 49 },
    { chapter: 3, versicles: 30 },
    { chapter: 4, versicles: 37 },
    { chapter: 5, versicles: 31 },
    { chapter: 6, versicles: 28 },
    { chapter: 7, versicles: 28 },
    { chapter: 8, versicles: 27 },
    { chapter: 9, versicles: 27 },
    { chapter: 10, versicles: 21 },
    { chapter: 11, versicles: 45 },
    { chapter: 12, versicles: 13 },
  ],
  os: [
    { chapter: 1, versicles: 11 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 5 },
    { chapter: 4, versicles: 19 },
    { chapter: 5, versicles: 15 },
    { chapter: 6, versicles: 11 },
    { chapter: 7, versicles: 16 },
    { chapter: 8, versicles: 14 },
    { chapter: 9, versicles: 17 },
    { chapter: 10, versicles: 15 },
    { chapter: 11, versicles: 12 },
    { chapter: 12, versicles: 14 },
    { chapter: 13, versicles: 16 },
    { chapter: 14, versicles: 9 },
  ],
  jl: [
    { chapter: 1, versicles: 20 },
    { chapter: 2, versicles: 32 },
    { chapter: 3, versicles: 21 },
  ],
  am: [
    { chapter: 1, versicles: 15 },
    { chapter: 2, versicles: 16 },
    { chapter: 3, versicles: 15 },
    { chapter: 4, versicles: 13 },
    { chapter: 5, versicles: 27 },
    { chapter: 6, versicles: 14 },
    { chapter: 7, versicles: 17 },
    { chapter: 8, versicles: 14 },
    { chapter: 9, versicles: 15 },
  ],
  ob: [{ chapter: 1, versicles: 21 }],
  jn: [
    { chapter: 1, versicles: 17 },
    { chapter: 2, versicles: 10 },
    { chapter: 3, versicles: 10 },
    { chapter: 4, versicles: 11 },
  ],
  mq: [
    { chapter: 1, versicles: 16 },
    { chapter: 2, versicles: 13 },
    { chapter: 3, versicles: 12 },
    { chapter: 4, versicles: 13 },
    { chapter: 5, versicles: 15 },
    { chapter: 6, versicles: 16 },
    { chapter: 7, versicles: 20 },
  ],
  na: [
    { chapter: 1, versicles: 15 },
    { chapter: 2, versicles: 13 },
    { chapter: 3, versicles: 19 },
  ],
  hc: [
    { chapter: 1, versicles: 17 },
    { chapter: 2, versicles: 20 },
    { chapter: 3, versicles: 19 },
  ],
  sf: [
    { chapter: 1, versicles: 18 },
    { chapter: 2, versicles: 15 },
    { chapter: 3, versicles: 20 },
  ],
  ag: [
    { chapter: 1, versicles: 15 },
    { chapter: 2, versicles: 23 },
  ],
  zc: [
    { chapter: 1, versicles: 21 },
    { chapter: 2, versicles: 13 },
    { chapter: 3, versicles: 10 },
    { chapter: 4, versicles: 14 },
    { chapter: 5, versicles: 11 },
    { chapter: 6, versicles: 15 },
    { chapter: 7, versicles: 14 },
    { chapter: 8, versicles: 23 },
    { chapter: 9, versicles: 17 },
    { chapter: 10, versicles: 12 },
    { chapter: 11, versicles: 17 },
    { chapter: 12, versicles: 14 },
    { chapter: 13, versicles: 9 },
    { chapter: 14, versicles: 21 },
  ],
  ml: [
    { chapter: 1, versicles: 14 },
    { chapter: 2, versicles: 17 },
    { chapter: 3, versicles: 18 },
    { chapter: 4, versicles: 6 },
  ],
  mt: [
    { chapter: 1, versicles: 25 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 17 },
    { chapter: 4, versicles: 25 },
    { chapter: 5, versicles: 48 },
    { chapter: 6, versicles: 34 },
    { chapter: 7, versicles: 29 },
    { chapter: 8, versicles: 34 },
    { chapter: 9, versicles: 38 },
    { chapter: 10, versicles: 42 },
    { chapter: 11, versicles: 30 },
    { chapter: 12, versicles: 50 },
    { chapter: 13, versicles: 58 },
    { chapter: 14, versicles: 36 },
    { chapter: 15, versicles: 39 },
    { chapter: 16, versicles: 28 },
    { chapter: 17, versicles: 27 },
    { chapter: 18, versicles: 35 },
    { chapter: 19, versicles: 30 },
    { chapter: 20, versicles: 34 },
    { chapter: 21, versicles: 46 },
    { chapter: 22, versicles: 46 },
    { chapter: 23, versicles: 39 },
    { chapter: 24, versicles: 51 },
    { chapter: 25, versicles: 46 },
    { chapter: 26, versicles: 75 },
    { chapter: 27, versicles: 66 },
    { chapter: 28, versicles: 20 },
  ],
  mc: [
    { chapter: 1, versicles: 45 },
    { chapter: 2, versicles: 28 },
    { chapter: 3, versicles: 35 },
    { chapter: 4, versicles: 41 },
    { chapter: 5, versicles: 43 },
    { chapter: 6, versicles: 56 },
    { chapter: 7, versicles: 37 },
    { chapter: 8, versicles: 38 },
    { chapter: 9, versicles: 50 },
    { chapter: 10, versicles: 52 },
    { chapter: 11, versicles: 33 },
    { chapter: 12, versicles: 44 },
    { chapter: 13, versicles: 37 },
    { chapter: 14, versicles: 72 },
    { chapter: 15, versicles: 47 },
    { chapter: 16, versicles: 20 },
  ],
  lc: [
    { chapter: 1, versicles: 80 },
    { chapter: 2, versicles: 52 },
    { chapter: 3, versicles: 38 },
    { chapter: 4, versicles: 44 },
    { chapter: 5, versicles: 39 },
    { chapter: 6, versicles: 49 },
    { chapter: 7, versicles: 50 },
    { chapter: 8, versicles: 56 },
    { chapter: 9, versicles: 62 },
    { chapter: 10, versicles: 42 },
    { chapter: 11, versicles: 54 },
    { chapter: 12, versicles: 59 },
    { chapter: 13, versicles: 35 },
    { chapter: 14, versicles: 35 },
    { chapter: 15, versicles: 32 },
    { chapter: 16, versicles: 31 },
    { chapter: 17, versicles: 37 },
    { chapter: 18, versicles: 43 },
    { chapter: 19, versicles: 48 },
    { chapter: 20, versicles: 47 },
    { chapter: 21, versicles: 38 },
    { chapter: 22, versicles: 71 },
    { chapter: 23, versicles: 56 },
    { chapter: 24, versicles: 53 },
  ],
  jo: [
    { chapter: 1, versicles: 51 },
    { chapter: 2, versicles: 25 },
    { chapter: 3, versicles: 36 },
    { chapter: 4, versicles: 54 },
    { chapter: 5, versicles: 47 },
    { chapter: 6, versicles: 71 },
    { chapter: 7, versicles: 53 },
    { chapter: 8, versicles: 59 },
    { chapter: 9, versicles: 41 },
    { chapter: 10, versicles: 42 },
    { chapter: 11, versicles: 57 },
    { chapter: 12, versicles: 50 },
    { chapter: 13, versicles: 38 },
    { chapter: 14, versicles: 31 },
    { chapter: 15, versicles: 27 },
    { chapter: 16, versicles: 33 },
    { chapter: 17, versicles: 26 },
    { chapter: 18, versicles: 40 },
    { chapter: 19, versicles: 42 },
    { chapter: 20, versicles: 31 },
    { chapter: 21, versicles: 25 },
  ],
  at: [
    { chapter: 1, versicles: 26 },
    { chapter: 2, versicles: 47 },
    { chapter: 3, versicles: 26 },
    { chapter: 4, versicles: 37 },
    { chapter: 5, versicles: 42 },
    { chapter: 6, versicles: 15 },
    { chapter: 7, versicles: 60 },
    { chapter: 8, versicles: 40 },
    { chapter: 9, versicles: 43 },
    { chapter: 10, versicles: 48 },
    { chapter: 11, versicles: 30 },
    { chapter: 12, versicles: 25 },
    { chapter: 13, versicles: 52 },
    { chapter: 14, versicles: 28 },
    { chapter: 15, versicles: 41 },
    { chapter: 16, versicles: 40 },
    { chapter: 17, versicles: 34 },
    { chapter: 18, versicles: 28 },
    { chapter: 19, versicles: 41 },
    { chapter: 20, versicles: 38 },
    { chapter: 21, versicles: 40 },
    { chapter: 22, versicles: 30 },
    { chapter: 23, versicles: 35 },
    { chapter: 24, versicles: 27 },
    { chapter: 25, versicles: 27 },
    { chapter: 26, versicles: 32 },
    { chapter: 27, versicles: 44 },
    { chapter: 28, versicles: 31 },
  ],
  rm: [
    { chapter: 1, versicles: 32 },
    { chapter: 2, versicles: 29 },
    { chapter: 3, versicles: 31 },
    { chapter: 4, versicles: 25 },
    { chapter: 5, versicles: 21 },
    { chapter: 6, versicles: 23 },
    { chapter: 7, versicles: 25 },
    { chapter: 8, versicles: 39 },
    { chapter: 9, versicles: 33 },
    { chapter: 10, versicles: 21 },
    { chapter: 11, versicles: 36 },
    { chapter: 12, versicles: 21 },
    { chapter: 13, versicles: 14 },
    { chapter: 14, versicles: 23 },
    { chapter: 15, versicles: 33 },
    { chapter: 16, versicles: 27 },
  ],
  // "1co": [
  //   { chapter: 1, versicles: 31 },
  //   { chapter: 2, versicles: 16 },
  //   { chapter: 3, versicles: 23 },
  //   { chapter: 4, versicles: 21 },
  //   { chapter: 5, versicles: 13 },
  //   { chapter: 6, versicles: 20 },
  //   { chapter: 7, versicles: 40 },
  //   { chapter: 8, versicles: 13 },
  //   { chapter: 9, versicles: 27 },
  //   { chapter: 10, versicles: 33 },
  //   { chapter: 11, versicles: 34 },
  //   { chapter: 12, versicles: 31 },
  //   { chapter: 13, versicles: 13 },
  //   { chapter: 14, versicles: 40 },
  //   { chapter: 15, versicles: 58 },
  //   { chapter: 16, versicles: 24 },
  // ],
  // "2co": [
  //   { chapter: 1, versicles: 24 },
  //   { chapter: 2, versicles: 17 },
  //   { chapter: 3, versicles: 18 },
  //   { chapter: 4, versicles: 18 },
  //   { chapter: 5, versicles: 21 },
  //   { chapter: 6, versicles: 18 },
  //   { chapter: 7, versicles: 16 },
  //   { chapter: 8, versicles: 24 },
  //   { chapter: 9, versicles: 15 },
  //   { chapter: 10, versicles: 18 },
  //   { chapter: 11, versicles: 33 },
  //   { chapter: 12, versicles: 21 },
  //   { chapter: 13, versicles: 14 },
  // ],
  gl: [
    { chapter: 1, versicles: 24 },
    { chapter: 2, versicles: 21 },
    { chapter: 3, versicles: 29 },
    { chapter: 4, versicles: 31 },
    { chapter: 5, versicles: 26 },
    { chapter: 6, versicles: 18 },
  ],
  ef: [
    { chapter: 1, versicles: 23 },
    { chapter: 2, versicles: 22 },
    { chapter: 3, versicles: 21 },
    { chapter: 4, versicles: 32 },
    { chapter: 5, versicles: 33 },
    { chapter: 6, versicles: 24 },
  ],
  fp: [
    { chapter: 1, versicles: 30 },
    { chapter: 2, versicles: 30 },
    { chapter: 3, versicles: 21 },
    { chapter: 4, versicles: 23 },
  ],
  cl: [
    { chapter: 1, versicles: 29 },
    { chapter: 2, versicles: 23 },
    { chapter: 3, versicles: 25 },
    { chapter: 4, versicles: 18 },
  ],
  // "1ts": [
  //   { chapter: 1, versicles: 10 },
  //   { chapter: 2, versicles: 20 },
  //   { chapter: 3, versicles: 13 },
  //   { chapter: 4, versicles: 18 },
  //   { chapter: 5, versicles: 28 },
  // ],
  // "2ts": [
  //   { chapter: 1, versicles: 12 },
  //   { chapter: 2, versicles: 17 },
  //   { chapter: 3, versicles: 18 },
  // ],
  // "1tm": [
  //   { chapter: 1, versicles: 20 },
  //   { chapter: 2, versicles: 15 },
  //   { chapter: 3, versicles: 16 },
  //   { chapter: 4, versicles: 16 },
  //   { chapter: 5, versicles: 25 },
  //   { chapter: 6, versicles: 21 },
  // ],
  // "2tm": [
  //   { chapter: 1, versicles: 18 },
  //   { chapter: 2, versicles: 26 },
  //   { chapter: 3, versicles: 17 },
  //   { chapter: 4, versicles: 22 },
  // ],
  tt: [
    { chapter: 1, versicles: 16 },
    { chapter: 2, versicles: 15 },
    { chapter: 3, versicles: 15 },
  ],
  fm: [{ chapter: 1, versicles: 25 }],
  hb: [
    { chapter: 1, versicles: 14 },
    { chapter: 2, versicles: 18 },
    { chapter: 3, versicles: 19 },
    { chapter: 4, versicles: 16 },
    { chapter: 5, versicles: 14 },
    { chapter: 6, versicles: 20 },
    { chapter: 7, versicles: 28 },
    { chapter: 8, versicles: 13 },
    { chapter: 9, versicles: 28 },
    { chapter: 10, versicles: 39 },
    { chapter: 11, versicles: 40 },
    { chapter: 12, versicles: 29 },
    { chapter: 13, versicles: 25 },
  ],
  tg: [
    { chapter: 1, versicles: 27 },
    { chapter: 2, versicles: 26 },
    { chapter: 3, versicles: 18 },
    { chapter: 4, versicles: 17 },
    { chapter: 5, versicles: 20 },
  ],
  // "1pe": [
  //   { chapter: 1, versicles: 25 },
  //   { chapter: 2, versicles: 25 },
  //   { chapter: 3, versicles: 22 },
  //   { chapter: 4, versicles: 19 },
  //   { chapter: 5, versicles: 14 },
  // ],
  // "2pe": [
  //   { chapter: 1, versicles: 21 },
  //   { chapter: 2, versicles: 22 },
  //   { chapter: 3, versicles: 18 },
  // ],
  // "1jo": [
  //   { chapter: 1, versicles: 10 },
  //   { chapter: 2, versicles: 29 },
  //   { chapter: 3, versicles: 24 },
  //   { chapter: 4, versicles: 21 },
  //   { chapter: 5, versicles: 21 },
  // ],
  // "2jo": [{ chapter: 1, versicles: 13 }],
  // "3jo": [{ chapter: 1, versicles: 15 }],
  jd: [{ chapter: 1, versicles: 25 }],
  ap: [
    { chapter: 1, versicles: 20 },
    { chapter: 2, versicles: 29 },
    { chapter: 3, versicles: 22 },
    { chapter: 4, versicles: 11 },
    { chapter: 5, versicles: 14 },
    { chapter: 6, versicles: 17 },
    { chapter: 7, versicles: 17 },
    { chapter: 8, versicles: 13 },
    { chapter: 9, versicles: 21 },
    { chapter: 10, versicles: 11 },
    { chapter: 11, versicles: 19 },
    { chapter: 12, versicles: 18 },
    { chapter: 13, versicles: 18 },
    { chapter: 14, versicles: 20 },
    { chapter: 15, versicles: 8 },
    { chapter: 16, versicles: 21 },
    { chapter: 17, versicles: 18 },
    { chapter: 18, versicles: 24 },
    { chapter: 19, versicles: 21 },
    { chapter: 20, versicles: 15 },
    { chapter: 21, versicles: 27 },
    { chapter: 22, versicles: 21 },
  ],
};

function getRandomVerse() {
	const actualDate = new Date().toISOString().slice(0, 10);
  const hash = hashCode(actualDate);
	
	const books = Object.keys(bible);
	const booksIndex = ((hash % books.length) + books.length) % books.length;
	const book = books[booksIndex];

	const chapters = bible[book];
	const chapterIndex = (((hash >> 16) % chapters.length) + chapters.length) % chapters.length;
	const { chapter, versicles } = bible[book][chapterIndex];

	const verse = (((hash >> 8) % versicles) + versicles) % versicles;
	
	return { book, chapter, verse }
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

function getAnswer(book, chapter, verse) {
	let answer = "";
	answer += book.slice(0, 2).toUpperCase();
	answer += chapter.toString().length === 2 ? chapter : "0" + chapter;
	answer += verse.toString().length === 2 ? verse : "0" + verse;
	return answer;
}

const buttons = document.querySelectorAll("button")

buttons.forEach((button) => {
	button.addEventListener("click", () => {
		const isNumber = /^\d$/;

		if (button.id === "kbd_enter") {
			const event = new KeyboardEvent("keyup", { key: "Enter" });
			document.body.dispatchEvent(event);
		} else if (button.id === "kbd_backspace") { 
			const event = new KeyboardEvent("keyup", { key: "Backspace"});
			document.body.dispatchEvent(event);	
		} else if (isNumber.test(button.textContent)) { 
			const event = new KeyboardEvent("keyup", { key: button.textContent, code: `Digit${button.textContent}` });
			document.body.dispatchEvent(event);	
		} else {
			const event = new KeyboardEvent("keyup", { key: button.textContent, code: `Key${button.textContent}` });
			document.body.dispatchEvent(event);
		}
	})
})

function setItemUntilNextDay(key, value) {
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  let timeUntilMidnight = tomorrow.getTime() - Date.now();

  localStorage.setItem(
    key,
    JSON.stringify({
      value: value,
      expirationTime: Date.now() + timeUntilMidnight,
    })
  );
}

function setTry(value, won) {
	const game = JSON.parse(localStorage.getItem("game"));
	
	const tries = game.tries;

	localStorage.setItem("game", JSON.stringify({
		...game,
		tries: [...tries, value],
		won: won || null,
	}))
}

function setGame(answer, versicle) {
	localStorage.setItem("game", JSON.stringify({
		answer,
		versicle,
		tries: [],
		currentStreak: 0,
		greatestStreak: 0,
		won: null,
	}));
}

function updateGame(game, answer, versicle, won) {
	localStorage.setItem("game", JSON.stringify({
		...game,
		answer,
		versicle,
	}));
}



function restartGame(game, answer, versicle) {
  localStorage.setItem(
    "game",
    JSON.stringify({
      ...game,
      answer,
			versicle,
			tries: []
    })
  );
}

function getGame() {
	return JSON.parse(localStorage.getItem("game")) || null;
}

function getItemUntilNextDay(key) {
  let item = localStorage.getItem(key);
  if (item) {
		data = JSON.parse(item);
		
    if (Date.now() >= data.expirationTime) {
      localStorage.removeItem(key);
      return null;
    } else {
      return data.value;
    }
  }
  return null; // Item not found or expired
}

function stopLoading() {
	const loading = document.getElementById("loading");
	const main = document.querySelector("main");
	const keyboard = document.getElementById("keyboard");

	loading.setAttribute("style", "display: none");
	main.setAttribute("style", "display: flex");
	keyboard.setAttribute("style", "display: flex");
}