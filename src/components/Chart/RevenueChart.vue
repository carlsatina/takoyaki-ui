<template>
  <div class="chart-container p-3">
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>
<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'
import annotationPlugin from 'chartjs-plugin-annotation'

// Register chart.js components
ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, CategoryScale,
  LinearScale, PointElement,
  BarElement,
  annotationPlugin
)

// Props (extract to variable!)
const props = defineProps({
  salesData: {
    type: Array,
    required: true
  }
})

// List of 24 hour labels
const hourLabels = Array.from({ length: 24 }, (_, i) =>
  new Date(0, 0, 0, i)
  .toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
  .replace(/\s/g, '')
  .toLowerCase()
) // ['12am', '1am', ..., '11pm']

// Computed chart data
const chartData = computed(() => {
  if (!Array.isArray(props.salesData) || props.salesData.length === 0) return null

  // Map sales data to an object for quick lookup
  const salesMap = Object.fromEntries(
    props.salesData.map(entry => [entry.saleDate.toLowerCase(), entry.totalRevenue])
  )

  // Get sales values for all hours
  const salesValues = hourLabels.map(hour => salesMap[hour] || 0)
  
  // Calculate statistics
  const maxSales = Math.max(...salesValues)
  const avgSales = salesValues.reduce((a, b) => a + b, 0) / salesValues.length
  const peakHourIndex = salesValues.indexOf(maxSales)
  
  // Color coding based on sales performance
  const getBarColor = (value, index) => {
    if (index === peakHourIndex && value > 0) {
      return '#28a745' // Green for peak hour
    } else if (value >= avgSales) {
      return '#007bff' // Blue for above average
    } else if (value > 0) {
      return '#ffc107' // Yellow for below average
    } else {
      return '#e9ecef' // Gray for no sales
    }
  }

  return {
    labels: hourLabels,
    datasets: [
      {
        label: 'Hourly Sales',
        backgroundColor: salesValues.map((value, index) => getBarColor(value, index)),
        borderColor: salesValues.map((value, index) => {
          if (index === peakHourIndex && value > 0) return '#1e7e34'
          if (value >= avgSales) return '#0056b3'
          if (value > 0) return '#e0a800'
          return '#dee2e6'
        }),
        borderWidth: 2,
        data: salesValues,
        borderRadius: 4,
      }
    ]
  }
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: true,
      position: 'top',
      labels: {
        generateLabels: () => [
          {
            text: 'Peak Hour',
            fillStyle: '#28a745',
            strokeStyle: '#1e7e34',
            lineWidth: 2
          },
          {
            text: 'Above Average',
            fillStyle: '#007bff',
            strokeStyle: '#0056b3',
            lineWidth: 2
          },
          {
            text: 'Below Average',
            fillStyle: '#ffc107',
            strokeStyle: '#e0a800',
            lineWidth: 2
          }
        ]
      }
    },
    title: {
      display: true,
      text: 'Sales Per Hour',
      font: {
        size: 16,
        weight: 'bold'
      },
      padding: {
        bottom: 10
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.parsed.y
          const avg = context.dataset.data.reduce((a, b) => a + b, 0) / context.dataset.data.length
          const isPeak = value === Math.max(...context.dataset.data)
          
          let label = `Sales: ₱${value.toLocaleString()}`
          if (isPeak && value > 0) {
            label += ' 🏆 Peak Hour'
          } else if (value >= avg) {
            label += ' ⬆️ Above Avg'
          } else if (value > 0) {
            label += ' ⬇️ Below Avg'
          }
          return label
        }
      }
    },
    annotation: {
      annotations: {
        averageLine: {
          type: 'line',
          yMin: computed(() => {
            if (!props.salesData || props.salesData.length === 0) return 0
            const salesMap = Object.fromEntries(
              props.salesData.map(entry => [entry.saleDate.toLowerCase(), entry.totalRevenue])
            )
            const values = hourLabels.map(hour => salesMap[hour] || 0)
            return values.reduce((a, b) => a + b, 0) / values.length
          }).value,
          yMax: computed(() => {
            if (!props.salesData || props.salesData.length === 0) return 0
            const salesMap = Object.fromEntries(
              props.salesData.map(entry => [entry.saleDate.toLowerCase(), entry.totalRevenue])
            )
            const values = hourLabels.map(hour => salesMap[hour] || 0)
            return values.reduce((a, b) => a + b, 0) / values.length
          }).value,
          borderColor: '#dc3545',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            display: true,
            content: 'Average',
            position: 'end',
            backgroundColor: '#dc3545',
            color: 'white',
            font: {
              size: 11,
              weight: 'bold'
            }
          }
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '₱' + value.toLocaleString()
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 350px;
  background: white;
  border-radius: 8px;
}
</style>
