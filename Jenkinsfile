pipeline {
    agent any

    environment {
        CI = 'true'
        NODE_ENV = 'test'
        // Playwright needs a writable home for browser cache
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.playwright-browsers"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                sh 'npx playwright install chromium --with-deps'
            }
        }

        stage('Run Tests') {
            steps {
                // catchError keeps the pipeline running so Generate Report always executes
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    sh 'npx playwright test'
                }
            }
        }

        stage('Generate Report') {
            steps {
                echo 'Playwright HTML report: playwright-report/index.html'
                echo 'JUnit XML report:       test-results/junit.xml'
            }
        }

        stage('AI Analysis') {
            when {
                expression { currentBuild.currentResult == 'FAILURE' }
            }
            steps {
                withCredentials([string(credentialsId: 'ANTHROPIC_API_KEY', variable: 'ANTHROPIC_API_KEY')]) {
                    // Keep the build at FAILURE; mark only this stage UNSTABLE if the script itself errors
                    catchError(buildResult: 'FAILURE', stageResult: 'UNSTABLE') {
                        sh 'pip install --quiet anthropic'
                        sh 'python3 failure-agent.py test-results/results.json'
                    }
                }
            }
        }
    }

    post {
        always {
            // Publish JUnit XML results for Jenkins test trend graphs
            junit(
                testResults: 'test-results/junit.xml',
                allowEmptyResults: true
            )

            // Archive the HTML report as a build artifact
            publishHTML(target: [
                allowMissing         : true,
                alwaysLinkToLastBuild: true,
                keepAll              : true,
                reportDir            : 'playwright-report',
                reportFiles          : 'index.html',
                reportName           : 'Playwright Test Report'
            ])

            // Archive the full Playwright report folder
            archiveArtifacts(
                artifacts: 'playwright-report/**',
                allowEmptyArchive: true
            )

            // Archive videos/traces for failed tests
            archiveArtifacts(
                artifacts: 'test-results/**',
                allowEmptyArchive: true
            )
        }

        failure {
            echo 'Tests failed. Check the Playwright report for details.'
        }

        success {
            echo 'All tests passed.'
        }
    }
}
