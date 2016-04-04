(function() {

	function getText() {
		var wrapper = document.querySelector('#plots .content ul')
		if (wrapper) {
			return wrapper.innerHTML.replace(/<[^>]*>/g, '')
		} else {
			return false
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
			return false
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

	function likeness(textA, textB) {
		// @TODO
		return 1/Math.abs(textA.length - textB.length)
	}

	function getPrediction(text, movies) {
		var ratings = {}
		var total = {
			rating: 0,
			weight: 0
		}
		for (var key in movies) {
			ratings[movies[key].rating] = likeness(text, movies[key].text)
		}
		for (var key in ratings) {
			total.rating += ratings[key] * key
			total.weight += ratings[key]
		}
		if (total.weight > 0) {
			return total.rating / total.weight
		}
		return false
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



	var id = getId()
	var text = getText()
	var rating = getRating()

	if (id && text) {
		chrome.storage.local.get(['movies'], function(result) {
			var movies = result.movies ? result.movies : {}

			if (rating) {
				// Save rating
				movies[id] = {
					text: text,
					rating: rating
				}
				chrome.storage.local.set({movies: movies})
			} else {
				// Predict rating
				var prediction = getPrediction(text, movies)
				if (prediction !== false) {
					showPrediction(prediction)
				}
			}

		})
	}

})()