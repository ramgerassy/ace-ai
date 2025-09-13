#!/bin/bash

# QuizMaster API Test Script
# Usage: ./test_api.sh [endpoint]
# 
# Available endpoints:
#   health       - Test health check endpoints
#   verify       - Test subject verification
#   subsubject   - Test sub-subject verification  
#   generate     - Test quiz generation
#   review       - Test quiz review
#   errors       - Test error scenarios
#   all          - Run all tests (default)

# Configuration
BASE_URL="http://localhost:3000"
API_URL="${BASE_URL}/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}➤ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Test health endpoints
test_health() {
    print_header "HEALTH CHECK TESTS"
    
    print_test "Testing system health endpoint"
    curl -s -X GET "${BASE_URL}/health" \
        -H "Content-Type: application/json" | jq '.'
    
    echo -e "\n"
    print_test "Testing API health endpoint"
    curl -s -X GET "${API_URL}/health" \
        -H "Content-Type: application/json" | jq '.'
}

# Test subject verification
test_verify_subject() {
    print_header "SUBJECT VERIFICATION TESTS"
    
    print_test "Testing valid subject: 'Computer Science'"
    curl -s -X POST "${API_URL}/verify-subject" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Computer Science"
        }' | jq '.'
    
    echo -e "\n"
    print_test "Testing invalid/broad subject: 'Science'"
    curl -s -X POST "${API_URL}/verify-subject" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Science"
        }' | jq '.'
    
    echo -e "\n"
    print_test "Testing another valid subject: 'World History'"
    curl -s -X POST "${API_URL}/verify-subject" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "World History"
        }' | jq '.'
}

# Test sub-subject verification
test_verify_subsubject() {
    print_header "SUB-SUBJECT VERIFICATION TESTS"
    
    print_test "Testing valid sub-subject: Math -> Calculus"
    curl -s -X POST "${API_URL}/verify-sub-subject" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Mathematics",
            "subSubject": "Calculus"
        }' | jq '.'
    
    echo -e "\n"
    print_test "Testing invalid sub-subject: Math -> Cooking"
    curl -s -X POST "${API_URL}/verify-sub-subject" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Mathematics", 
            "subSubject": "Cooking"
        }' | jq '.'
    
    echo -e "\n"
    print_test "Testing Computer Science -> Data Structures"
    curl -s -X POST "${API_URL}/verify-sub-subject" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Computer Science",
            "subSubject": "Data Structures"
        }' | jq '.'
}

# Test quiz generation
test_generate_quiz() {
    print_header "QUIZ GENERATION TESTS"
    
    print_test "Generating easy Computer Science quiz"
    curl -s -X POST "${API_URL}/generate-quiz" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Computer Science",
            "subSubjects": ["Data Structures", "Algorithms"],
            "level": "easy"
        }' | jq '.'
    
    echo -e "\n"
    print_test "Generating intermediate Math quiz (no sub-subjects)"
    curl -s -X POST "${API_URL}/generate-quiz" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Mathematics",
            "subSubjects": [],
            "level": "intermediate"
        }' | jq '.'
    
    echo -e "\n"
    print_test "Generating hard History quiz with multiple sub-subjects"
    curl -s -X POST "${API_URL}/generate-quiz" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "World History",
            "subSubjects": ["Ancient Rome", "Medieval Europe", "Renaissance"],
            "level": "hard"
        }' | jq '.'
}

# Test quiz review
test_review_quiz() {
    print_header "QUIZ REVIEW TESTS"
    
    print_test "Reviewing sample quiz answers"
    curl -s -X POST "${API_URL}/review-quiz" \
        -H "Content-Type: application/json" \
        -d '{
            "userAnswers": [
                {
                    "questionNum": 1,
                    "question": "What is the time complexity of binary search?",
                    "possibleAnswers": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
                    "correctAnswer": [1],
                    "userAnswer": [1]
                },
                {
                    "questionNum": 2,
                    "question": "Which sorting algorithm has the best average case?",
                    "possibleAnswers": ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"],
                    "correctAnswer": [1],
                    "userAnswer": [0]
                },
                {
                    "questionNum": 3,
                    "question": "What is a stack?",
                    "possibleAnswers": ["FIFO structure", "LIFO structure", "Random access", "Tree structure"],
                    "correctAnswer": [1],
                    "userAnswer": [1]
                },
                {
                    "questionNum": 4,
                    "question": "Which data structures allow O(1) insertion?",
                    "possibleAnswers": ["Array", "Linked List", "Hash Table", "Binary Tree"],
                    "correctAnswer": [1, 2],
                    "userAnswer": [2]
                },
                {
                    "questionNum": 5,
                    "question": "What is recursion?",
                    "possibleAnswers": ["Loop", "Function calling itself", "Data structure", "Algorithm"],
                    "correctAnswer": [1],
                    "userAnswer": [1]
                },
                {
                    "questionNum": 6,
                    "question": "Binary tree traversal methods include:",
                    "possibleAnswers": ["Inorder", "Preorder", "Postorder", "Level-order"],
                    "correctAnswer": [0, 1, 2, 3],
                    "userAnswer": [0, 1]
                },
                {
                    "questionNum": 7,
                    "question": "What is Big O notation for?",
                    "possibleAnswers": ["Memory usage", "Time complexity", "Code quality", "Performance analysis"],
                    "correctAnswer": [1, 3],
                    "userAnswer": [1, 3]
                },
                {
                    "questionNum": 8,
                    "question": "Hash collision resolution methods:",
                    "possibleAnswers": ["Chaining", "Open addressing", "Linear probing", "Rehashing"],
                    "correctAnswer": [0, 1, 2],
                    "userAnswer": [0, 1]
                },
                {
                    "questionNum": 9,
                    "question": "What is a queue?",
                    "possibleAnswers": ["LIFO", "FIFO", "Random", "Sorted"],
                    "correctAnswer": [1],
                    "userAnswer": []
                },
                {
                    "questionNum": 10,
                    "question": "Dynamic programming is used for:",
                    "possibleAnswers": ["Optimization", "Overlapping subproblems", "Memoization", "All above"],
                    "correctAnswer": [3],
                    "userAnswer": [3]
                }
            ]
        }' | jq '.'
}

# Test error scenarios
test_errors() {
    print_header "ERROR SCENARIO TESTS"
    
    print_test "Testing validation error: subject too short"
    curl -s -X POST "${API_URL}/verify-subject" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "a"
        }' | jq '.'
    
    echo -e "\n"
    print_test "Testing validation error: invalid difficulty level"
    curl -s -X POST "${API_URL}/generate-quiz" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Mathematics",
            "subSubjects": [],
            "level": "extreme"
        }' | jq '.'
    
    echo -e "\n"
    print_test "Testing validation error: too many sub-subjects"
    curl -s -X POST "${API_URL}/generate-quiz" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Computer Science",
            "subSubjects": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
            "level": "easy"
        }' | jq '.'
    
    echo -e "\n"
    print_test "Testing validation error: wrong number of answers in review"
    curl -s -X POST "${API_URL}/review-quiz" \
        -H "Content-Type: application/json" \
        -d '{
            "userAnswers": [
                {
                    "questionNum": 1,
                    "question": "Test question?",
                    "possibleAnswers": ["A", "B", "C", "D"],
                    "correctAnswer": [0],
                    "userAnswer": [0]
                }
            ]
        }' | jq '.'
    
    echo -e "\n"
    print_test "Testing 404 error: unknown endpoint"
    curl -s -X POST "${API_URL}/unknown-endpoint" \
        -H "Content-Type: application/json" \
        -d '{}' | jq '.'
    
    echo -e "\n"
    print_test "Testing malformed JSON"
    curl -s -X POST "${API_URL}/verify-subject" \
        -H "Content-Type: application/json" \
        -d '{"subject": "Math"' | jq '.'
}

# Test rate limiting (be careful with this one!)
test_rate_limiting() {
    print_header "RATE LIMITING TEST (Limited)"
    
    print_test "Testing rate limiting with multiple requests"
    echo "Sending 5 quick requests to verify-subject..."
    
    for i in {1..5}; do
        echo "Request $i:"
        curl -s -X POST "${API_URL}/verify-subject" \
            -H "Content-Type: application/json" \
            -d "{\"subject\": \"Test Subject $i\"}" | jq -c '{success, valid, message}'
        sleep 1
    done
}

# Performance test
test_performance() {
    print_header "PERFORMANCE TESTS"
    
    print_test "Timing subject verification"
    time curl -s -X POST "${API_URL}/verify-subject" \
        -H "Content-Type: application/json" \
        -d '{"subject": "Computer Science"}' > /dev/null
    
    echo -e "\n"
    print_test "Timing quiz generation (this may take 30-45 seconds)"
    time curl -s -X POST "${API_URL}/generate-quiz" \
        -H "Content-Type: application/json" \
        -d '{
            "subject": "Mathematics",
            "subSubjects": ["Algebra"],
            "level": "easy"
        }' > /dev/null
}

# Main execution
main() {
    local test_type="${1:-all}"
    
    # Check if server is running
    if ! curl -s "${BASE_URL}/health" > /dev/null; then
        print_error "Server is not running at ${BASE_URL}"
        print_error "Please start the server with: npm run dev"
        exit 1
    fi
    
    print_success "Server is running at ${BASE_URL}"
    
    case $test_type in
        "health")
            test_health
            ;;
        "verify")
            test_verify_subject
            ;;
        "subsubject")
            test_verify_subsubject
            ;;
        "generate")
            test_generate_quiz
            ;;
        "review")
            test_review_quiz
            ;;
        "errors")
            test_errors
            ;;
        "rate")
            test_rate_limiting
            ;;
        "performance")
            test_performance
            ;;
        "all")
            test_health
            test_verify_subject
            test_verify_subsubject
            test_generate_quiz
            test_review_quiz
            test_errors
            ;;
        *)
            echo "Usage: $0 [health|verify|subsubject|generate|review|errors|rate|performance|all]"
            exit 1
            ;;
    esac
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    print_error "jq is required for JSON formatting but not installed"
    print_error "Install with: sudo apt-get install jq (Ubuntu) or brew install jq (Mac)"
    print_error "The script will still work but output won't be formatted"
fi

# Run the tests
main "$@"