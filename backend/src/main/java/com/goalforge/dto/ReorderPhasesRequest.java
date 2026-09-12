package com.goalforge.dto;

import java.util.List;

public class ReorderPhasesRequest {

    private List<Long> phaseIds;

    public ReorderPhasesRequest() {
    }

    public ReorderPhasesRequest(List<Long> phaseIds) {
        this.phaseIds = phaseIds;
    }

    public List<Long> getPhaseIds() {
        return phaseIds;
    }

    public void setPhaseIds(List<Long> phaseIds) {
        this.phaseIds = phaseIds;
    }
}
