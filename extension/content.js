(function() {

	function trim(text) {
		return text.replace(/^\s+|\s+$/g, '')
	}

	function getText() {
		var wrapper = document.querySelector('#plots .content ul')
		if (wrapper) {
			return trim(wrapper.innerHTML.replace(/<[^>]*>/g, ''))
		} else {
			return ''
		}
	}

	function getGenres() {
		var wrapper = document.querySelector('#profile .content .genre')
		if (wrapper) {
			var genres = wrapper.innerHTML.split('/')
			for (var i = genres.length - 1; i >= 0; i--) {
				genres[i] = trim(genres[i])
			}
			return genres
		} else {
			return []
		}
	}

	function getTitle() {
		var wrapper = document.querySelector('#profile .header h1')
		if (wrapper) {
			return trim(wrapper.innerHTML.replace(/<[^>]*>/g, ''))
		} else {
			return ''
		}
	}

	function getId() {
		var urlParts = window.location.href.split('/')
		var i = 0
		for (; i < urlParts.length; i++) {
			if (urlParts[i] === 'film') {
				i++;
				break;
			}
		}
		if (i >= urlParts.length) {
			return ''
		} else {
			return urlParts[i]
		}
	}

	function getRating() {
		var wrapper = document.querySelector('#my-rating .content .my-rating')
		if (wrapper && !wrapper.classList.contains('not-found')) {
			var starsCount = wrapper.querySelectorAll('img.rating').length
			return starsCount * 20
		} else {
			return false
		}
	}

	function likeness(movieA, movieB) {
		return compareTwoStrings(movieA.text, movieB.text)
	}

	function getPrediction(thisMovie, movies) {
		var maxLikeness = 0
		var bestMatchMovieKey = false

		for (var key in movies) {
			var thisLikeness = likeness(thisMovie, movies[key])
			if (thisLikeness > maxLikeness) {
				maxLikeness = thisLikeness
				bestMatchMovieKey = key
			}
		}

		console.log('Nejpodobnější: ', movies[bestMatchMovieKey].title)
		console.log(movies[bestMatchMovieKey])
		return movies[bestMatchMovieKey].rating
	}

	function showPrediction(rating) {
		var wrapper = document.querySelector('#rating .average')
		if (wrapper) {
			var prediction = document.createElement('span')
			prediction.innerHTML = Math.round(rating) + '%'
			prediction.title = 'Vaše předpokládané hodnocení'
			prediction.style.fontSize = '40%'
			prediction.style.position = 'absolute'
			prediction.style.top = '0'
			prediction.style.right = '0'
			prediction.style.padding = '5px 10px'
			prediction.style.background  = '#059'
			prediction.style.borderTopRightRadius = '10px'
			prediction.style.borderBottomLeftRadius = '10px'
			prediction.style.cursor = 'help'
			wrapper.appendChild(prediction)
		}
	}

	function createMovie(rating, title, text, genres) {
		console.log(arguments)
		return {
			rating: rating,
			title: title,
			text: text,
			genres: genres
		}
	}



	var id = getId()
	var text = getText()
	var title = getTitle()
	var rating = getRating()
	var genres = getGenres()

	if (id && text) {
		chrome.storage.local.get(['movies'], function(result) {
			var movies = result.movies ? result.movies : {}
			var thisMovie = createMovie(rating, title, text, genres)

			if (rating === false) {
				// Predict rating
				var prediction = getPrediction(thisMovie, movies)
				if (prediction !== false) {
					showPrediction(prediction)
				}
			} else {
				// Save rating
				movies[id] = thisMovie
				chrome.storage.local.set({movies: movies})
			}

		})
	}

})()
