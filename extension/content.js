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

	function compareGenres(genresA, genresB) {
		var itemsCount = genresA.length + genresB.length
		var matchesCount = 0

		for (var i = genresA.length - 1; i >= 0; i--) {
			if (genresB.indexOf(genresA[i]) > -1) {
				matchesCount += 2
			}
		}

		if (itemsCount === 0) {
			return 1
		} else {
			return matchesCount / itemsCount
		}
	}

	function likeness(movieA, movieB) {
		var texts = compareTwoStrings(movieA.text || '', movieB.text || '')
		var genres = compareGenres(movieA.genres || [], movieB.genres || [])

		// Genres have larger weight
		return (1*texts + 2*genres) / 3
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

		if (bestMatchMovieKey === false) {
			return false
		} else {
			return {
				'rating': movies[bestMatchMovieKey].rating,
				'similar': movies[bestMatchMovieKey]
			}
		}
	}

	function showPrediction(rating, similarMovie) {
		var wrapper = document.querySelector('#rating .average')
		if (wrapper) {
			var prediction = document.createElement('span')
			prediction.innerHTML = Math.round(rating) + '%'
			prediction.title = 'Odhad na základě podobnosti s: „'+similarMovie.title+'“'
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

	if (id) {
		chrome.storage.local.get(['movies'], function(result) {
			var movies = result.movies ? result.movies : {}
			var thisMovie = createMovie(rating, title, text, genres)

			if (rating === false) {
				// Predict rating
				var prediction = getPrediction(thisMovie, movies)
				if (prediction !== false) {
					showPrediction(prediction.rating, prediction.similar)
				}
			} else {
				// Save rating
				movies[id] = thisMovie
				chrome.storage.local.set({movies: movies})
			}

		})
	}

})()
