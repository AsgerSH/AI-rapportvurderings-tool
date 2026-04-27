package dk.ek.vurdering.dto;

import java.util.List;

public class EvaluationResponse {

    private String overallAssessment;
    private List<CriteriaFeedback> criteriaFeedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> improvements;
    private List<String> questions;

    public String getOverallAssessment() {
        return overallAssessment;
    }

    public void setOverallAssessment(String overallAssessment) {
        this.overallAssessment = overallAssessment;
    }

    public List<CriteriaFeedback> getCriteriaFeedback() {
        return criteriaFeedback;
    }

    public void setCriteriaFeedback(List<CriteriaFeedback> criteriaFeedback) {
        this.criteriaFeedback = criteriaFeedback;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }

    public List<String> getImprovements() {
        return improvements;
    }

    public void setImprovements(List<String> improvements) {
        this.improvements = improvements;
    }

    public List<String> getQuestions() {
        return questions;
    }

    public void setQuestions(List<String> questions) {
        this.questions = questions;
    }
}
