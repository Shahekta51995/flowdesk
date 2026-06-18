pipeline {
    agent any

    environment {
        APP_NAME    = "flowdesk"
        IMAGE_NAME  = "flowdesk-app"
        IMAGE_TAG   = "${BUILD_NUMBER}"
        COMPOSE_FILE = "docker-compose.yml"
    }

    stages {

        stage('📥 Checkout') {
            steps {
                echo '=== Checking out source code ==='
                checkout scm
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                echo '=== Installing Node.js dependencies ==='
                sh 'npm ci'
            }
        }

        stage('🔍 Lint') {
            steps {
                echo '=== Running ESLint ==='
                sh 'npm run lint || true'
            }
        }

        stage('🏗️ Build Docker Image') {
            steps {
                echo '=== Building Docker image ==='
                sh """
                    docker build \
                        -t ${IMAGE_NAME}:${IMAGE_TAG} \
                        -t ${IMAGE_NAME}:latest \
                        .
                """
            }
        }

        stage('🧪 Health Check') {
            steps {
                echo '=== Running container health check ==='
                sh """
                    docker run --rm -d \
                        --name ${IMAGE_NAME}-test \
                        -p 3001:3000 \
                        --env-file .env.docker \
                        ${IMAGE_NAME}:${IMAGE_TAG}

                    sleep 10

                    curl -f http://localhost:3001/api/health || exit 1

                    docker stop ${IMAGE_NAME}-test
                """
            }
        }

        stage('🚀 Deploy') {
            steps {
                echo '=== Deploying with Docker Compose ==='
                sh """
                    docker-compose down --remove-orphans || true
                    docker-compose --env-file .env.docker up -d --build flowdesk-app
                    docker-compose up -d flowdesk-nginx
                """
            }
        }

        stage('✅ Verify Deployment') {
            steps {
                echo '=== Verifying deployment ==='
                sh """
                    sleep 15
                    curl -f http://localhost/api/health || exit 1
                    echo "✅ Deployment successful!"
                """
            }
        }
    }

    post {
        success {
            echo """
            ╔══════════════════════════════════╗
            ║   ✅ FlowDesk deployed!           ║
            ║   Build: ${BUILD_NUMBER}          ║
            ║   URL: http://localhost           ║
            ╚══════════════════════════════════╝
            """
        }
        failure {
            echo """
            ╔══════════════════════════════════╗
            ║   ❌ Deployment FAILED!           ║
            ║   Check logs above               ║
            ╚══════════════════════════════════╝
            """
            sh "docker-compose down || true"
        }
        always {
            sh "docker system prune -f || true"
        }
    }
}