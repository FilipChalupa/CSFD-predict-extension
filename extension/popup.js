(function() {
	var registeredWrapper = document.getElementById('registered')
	chrome.storage.local.get(['movies'], function(result) {
		var movies = result.movies ? result.movies : {}

		console.log(movies)

		if (Object.keys(movies).length > 0) {
			var sortedMovieKeys = Object.keys(movies).sort(function(a,b){
				var titleA = movies[a].title.toLowerCase()
				var titleB = movies[b].title.toLowerCase()
				if (titleA < titleB) {
					return -1
				} else if (titleA > titleB) {
					return 1
				}
				return 0
			})

			registeredWrapper.innerHTML = ''

			for (var sortKey in sortedMovieKeys) {
				var key = sortedMovieKeys[sortKey]
				var movieEl = document.createElement('div')
				movieEl.classList.add('item')

				var movieScoreEl = document.createElement('span')
				movieScoreEl.classList.add('item-score')
				movieEl.appendChild(movieScoreEl)

				var titleNode = document.createTextNode(movies[key].title)
				movieEl.appendChild(titleNode)

				var scoreNode = document.createTextNode(Math.round(movies[key].rating)+'%')
				movieScoreEl.appendChild(scoreNode)

				registeredWrapper.appendChild(movieEl)
			}
		}
	})
})()