/* ==================== SCRIPT.JS ==================== */

document
	.getElementById('questionnaireForm')
	.addEventListener('submit', function (e) {
		e.preventDefault()

		// Check if all questions are answered
		const totalQuestions = 21
		let answeredQuestions = 0
		for (let i = 1; i <= totalQuestions; i++) {
			if (document.querySelector('input[name="q' + i + '"]:checked')) {
				answeredQuestions++
			}
		}

		if (answeredQuestions < totalQuestions) {
			alert(
				'Будь ласка, дайте відповідь на всі ' +
					totalQuestions +
					' питань. Ви відповіли на ' +
					answeredQuestions +
					' з ' +
					totalQuestions +
					'.'
			)
			return
		}

		// Calculate group scores
		const g1 =
			parseInt(document.querySelector('input[name="q1"]:checked').value) +
			parseInt(document.querySelector('input[name="q2"]:checked').value) +
			parseInt(document.querySelector('input[name="q3"]:checked').value) +
			parseInt(document.querySelector('input[name="q4"]:checked').value)

		const g2 =
			parseInt(document.querySelector('input[name="q5"]:checked').value) +
			parseInt(document.querySelector('input[name="q6"]:checked').value) +
			parseInt(document.querySelector('input[name="q7"]:checked').value)

		const g3 =
			parseInt(document.querySelector('input[name="q8"]:checked').value) +
			parseInt(document.querySelector('input[name="q9"]:checked').value)

		const g4 =
			parseInt(document.querySelector('input[name="q10"]:checked').value) +
			parseInt(document.querySelector('input[name="q11"]:checked').value) +
			parseInt(document.querySelector('input[name="q12"]:checked').value) +
			parseInt(document.querySelector('input[name="q13"]:checked').value) +
			parseInt(document.querySelector('input[name="q14"]:checked').value) +
			parseInt(document.querySelector('input[name="q15"]:checked').value) +
			parseInt(document.querySelector('input[name="q16"]:checked').value)

		const g5 =
			parseInt(document.querySelector('input[name="q17"]:checked').value) +
			parseInt(document.querySelector('input[name="q18"]:checked').value) +
			parseInt(document.querySelector('input[name="q19"]:checked').value) +
			parseInt(document.querySelector('input[name="q20"]:checked').value) +
			parseInt(document.querySelector('input[name="q21"]:checked').value)

		// Min and max values for each group
		const minMax = {
			g1: { min: 20, max: 115 },
			g2: { min: 15, max: 60 },
			g3: { min: 10, max: 50 },
			g4: { min: 50, max: 225 },
			g5: { min: 25, max: 90 },
		}

		// S-shaped membership function
		function sMembership(x, a, b) {
			if (x <= a) return 0
			if (x >= b) return 1
			if (x <= (a + b) / 2) {
				return 2 * Math.pow((x - a) / (b - a), 2)
			} else {
				return 1 - 2 * Math.pow((b - x) / (b - a), 2)
			}
		}

		// Calculate membership functions
		const mu1 = sMembership(g1, minMax.g1.min, minMax.g1.max)
		const mu2 = sMembership(g2, minMax.g2.min, minMax.g2.max)
		const mu3 = sMembership(g3, minMax.g3.min, minMax.g3.max)
		const mu4 = sMembership(g4, minMax.g4.min, minMax.g4.max)
		const mu5 = sMembership(g5, minMax.g5.min, minMax.g5.max)

		// Default weights
		const weights = [10, 8, 6, 7, 4]
		const sumWeights = weights.reduce((a, b) => a + b, 0)
		const normWeights = weights.map(w => w / sumWeights)

		// Aggregated score
		const aggregated = (
			mu1 * normWeights[0] +
			mu2 * normWeights[1] +
			mu3 * normWeights[2] +
			mu4 * normWeights[3] +
			mu5 * normWeights[4]
		).toFixed(3)

		// Linguistic assessment
		let assessment = ''
		if (aggregated > 0.67) {
			assessment = '🌟 Оцінка ідеї висока'
		} else if (aggregated > 0.47) {
			assessment = '📈 Оцінка ідеї вище середнього'
		} else if (aggregated > 0.36) {
			assessment = '📊 Оцінка ідеї середня'
		} else if (aggregated > 0.21) {
			assessment = '📉 Оцінка ідеї низька'
		} else {
			assessment = '⚠️ Оцінка ідеї дуже низька'
		}

		// Display results
		document.getElementById('group1').textContent =
			g1 + ' балів (μ = ' + mu1.toFixed(3) + ')'
		document.getElementById('group2').textContent =
			g2 + ' балів (μ = ' + mu2.toFixed(3) + ')'
		document.getElementById('group3').textContent =
			g3 + ' балів (μ = ' + mu3.toFixed(3) + ')'
		document.getElementById('group4').textContent =
			g4 + ' балів (μ = ' + mu4.toFixed(3) + ')'
		document.getElementById('group5').textContent =
			g5 + ' балів (μ = ' + mu5.toFixed(3) + ')'
		document.getElementById('totalScore').textContent = aggregated
		document.getElementById('assessment').textContent = assessment

		// Destroy existing charts if they exist
		if (window.groupChartInstance) {
			window.groupChartInstance.destroy()
		}
		if (window.comparisonChartInstance) {
			window.comparisonChartInstance.destroy()
		}

		// Create radar chart for groups
		const ctx1 = document.getElementById('groupChart').getContext('2d')
		window.groupChartInstance = new Chart(ctx1, {
			type: 'radar',
			data: {
				labels: [
					'Суть ідеї',
					'Автори ідеї',
					'Порівняльна характеристика',
					'Комерційна значимість',
					'Очікувані результати',
				],
				datasets: [
					{
						label: 'Функція належності (μ)',
						data: [mu1, mu2, mu3, mu4, mu5],
						fill: true,
						backgroundColor: 'rgba(74, 144, 226, 0.2)',
						borderColor: '#4a90e2',
						pointBackgroundColor: '#4a90e2',
						pointBorderColor: '#fff',
						pointHoverBackgroundColor: '#fff',
						pointHoverBorderColor: '#4a90e2',
						borderWidth: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				scales: {
					r: {
						beginAtZero: true,
						max: 1,
						ticks: {
							stepSize: 0.2,
							color: '#b8c5e0',
							backdropColor: 'transparent',
						},
						grid: {
							color: '#2d3561',
						},
						pointLabels: {
							color: '#e0e7ff',
							font: {
								size: 12,
							},
						},
					},
				},
				plugins: {
					legend: {
						labels: {
							color: '#e0e7ff',
						},
					},
				},
			},
		})

		// Create bar chart for comparison
		const ctx2 = document.getElementById('comparisonChart').getContext('2d')
		window.comparisonChartInstance = new Chart(ctx2, {
			type: 'bar',
			data: {
				labels: ['Група 1', 'Група 2', 'Група 3', 'Група 4', 'Група 5'],
				datasets: [
					{
						label: 'Отримані бали',
						data: [g1, g2, g3, g4, g5],
						backgroundColor: '#4a90e2',
						borderColor: '#6fb1fc',
						borderWidth: 1,
					},
					{
						label: 'Максимальні бали',
						data: [
							minMax.g1.max,
							minMax.g2.max,
							minMax.g3.max,
							minMax.g4.max,
							minMax.g5.max,
						],
						backgroundColor: '#2d3561',
						borderColor: '#4a5a8a',
						borderWidth: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							color: '#b8c5e0',
						},
						grid: {
							color: '#2d3561',
						},
					},
					x: {
						ticks: {
							color: '#b8c5e0',
						},
						grid: {
							color: '#2d3561',
						},
					},
				},
				plugins: {
					legend: {
						labels: {
							color: '#e0e7ff',
						},
					},
				},
			},
		})

		// Show results
		document.getElementById('results').classList.add('show')
		document
			.getElementById('results')
			.scrollIntoView({ behavior: 'smooth', block: 'start' })
	})

/* ==================== END SCRIPT.JS ==================== */
