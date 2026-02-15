import React from 'react';
import styles from './styles';
import useShredOS from './hooks/useShredOS';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PlanView from './components/PlanView';
import CoachView from './components/CoachView';
import Overlays from './components/Overlays';
import RenphoScanOverlay from './components/RenphoScanOverlay';

export default function App() {
  const s = useShredOS();

  if (!s.isReady) {
    return (
      <>
        <style>{styles}</style>
        <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>S</div>
            <span className="loading-spinner" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <Overlays
        showSetup={s.showSetup}
        setupDate={s.setupDate}
        setSetupDate={s.setSetupDate}
        handleStartSprint={s.handleStartSprint}
        confetti={s.confetti}
        showCopySuccess={s.showCopySuccess}
        showSettings={s.showSettings}
        setShowSettings={s.setShowSettings}
        apiProvider={s.apiProvider}
        setApiProvider={s.setApiProvider}
        apiKey={s.apiKey}
        setApiKey={s.setApiKey}
        isLoading={s.isLoading}
        onSprintPhotoBefore={s.handleSprintPhotoBefore}
        userProfile={s.userProfile}
        updateUserProfile={s.updateUserProfile}
        handleExportJSON={s.handleExportJSON}
        handleImportJSON={s.handleImportJSON}
        importFileRef={s.importFileRef}
        notifSettings={s.notifSettings}
        handleEnableNotifs={s.handleEnableNotifs}
        updateNotifSetting={s.updateNotifSetting}
        syncCode={s.syncCode}
        syncStatus={s.syncStatus}
        handleEnableSync={s.handleEnableSync}
        handleRestoreFromCloud={s.handleRestoreFromCloud}
      />

      <RenphoScanOverlay
        showRenphoScan={s.showRenphoScan}
        setShowRenphoScan={s.setShowRenphoScan}
        renphoScanResult={s.renphoScanResult}
        setRenphoScanResult={s.setRenphoScanResult}
        renphoScanError={s.renphoScanError}
        setRenphoScanError={s.setRenphoScanError}
        processRenphoPhoto={s.processRenphoPhoto}
        handleLogComposition={s.handleLogComposition}
        isLoading={s.isLoading}
        apiKey={s.apiKey}
        renphoFileRef={s.renphoFileRef}
      />

      <div className="app">
        <Header
          week={s.week}
          daysLeft={s.daysLeft}
          pct={s.pct}
          phase={s.phase}
          view={s.view}
          setView={s.setView}
          setShowSettings={s.setShowSettings}
        />

        <main
          className="content"
          key={s.view}
          onTouchStart={s.onTouchStart}
          onTouchMove={s.onTouchMove}
          onTouchEnd={s.onTouchEnd}
        >
          {s.view === 'dash' && (
            <DashboardView
              pct={s.pct}
              checkedCount={s.checkedCount}
              checklistItems={s.checklistItems}
              streak={s.streak}
              consumed={s.selectedConsumed}
              protein={s.protein}
              carbs={s.carbs}
              fat={s.fat}
              targetCals={s.targetCals}
              adjustedTargetCals={s.selectedAdjustedTargetCals}
              workoutCalories={s.selectedWorkoutCalories}
              meals={s.selectedMeals}
              mealHistory={s.mealHistory}
              mealForm={s.mealForm}
              setMealForm={s.setMealForm}
              handleAddMeal={s.handleAddMeal}
              handleDeleteMeal={s.handleDeleteMeal}
              weights={s.weights}
              weightDelta={s.weightDelta}
              weightInput={s.weightInput}
              setWeightInput={s.setWeightInput}
              handleLogWeight={s.handleLogWeight}
              week={s.week}
              startDate={s.startDate}
              handleReset={s.handleReset}
              bodyCompositions={s.bodyCompositions}
              showCompForm={s.showCompForm}
              setShowCompForm={s.setShowCompForm}
              handleLogComposition={s.handleLogComposition}
              setShowRenphoScan={s.setShowRenphoScan}
              apiKey={s.apiKey}
              isSprintCompleted={s.isSprintCompleted}
              sprintPhotos={s.sprintPhotos}
              onCaptureAfter={s.handleSprintPhotoAfter}
              onSaveComparison={s.handleSaveAiComparison}
              onNewSprint={s.handleNewSprint}
              copyMealPhotoPrompt={s.copyMealPhotoPrompt}
              handlePasteMeal={s.handlePasteMeal}
              todayWorkout={s.selectedWorkout}
              workoutHistory={s.workoutHistory}
              workoutFileRef={s.workoutFileRef}
              copyWorkoutPrompt={s.copyWorkoutPrompt}
              handlePasteWorkout={s.handlePasteWorkout}
              handleImportWorkoutCSV={s.handleImportWorkoutCSV}
              clearTodayWorkout={s.clearTodayWorkout}
              weeklyReport={s.weeklyReport}
              isToday={s.isToday}
              selectedDate={s.selectedDate}
              goToPrevDay={s.goToPrevDay}
              goToNextDay={s.goToNextDay}
              goToToday={s.goToToday}
            />
          )}

          {s.view === 'plan' && (
            <PlanView
              checklistItems={s.checklistItems}
              checks={s.checks}
              handleCheck={s.handleCheck}
              editingItem={s.editingItem}
              setEditingItem={s.setEditingItem}
              updateChecklistItem={s.updateChecklistItem}
              deleteChecklistItem={s.deleteChecklistItem}
              addChecklistItem={s.addChecklistItem}
              week={s.week}
              targetCals={s.targetCals}
              protein={s.protein}
              carbs={s.carbs}
              fat={s.fat}
              phase={s.phase}
            />
          )}

          {s.view === 'ai' && (
            <CoachView
              apiKey={s.apiKey}
              messages={s.messages}
              clearMessages={s.clearMessages}
              chatInput={s.chatInput}
              setChatInput={s.setChatInput}
              handleSendMessage={s.handleSendMessage}
              handleQuickPrompt={s.handleQuickPrompt}
              copyForClaude={s.copyForClaude}
              copyOneBetterPrompt={s.copyOneBetterPrompt}
              copyPhotoAnalysisPrompt={s.copyPhotoAnalysisPrompt}
              showCamera={s.showCamera}
              startCamera={s.startCamera}
              stopCamera={s.stopCamera}
              capturePhoto={s.capturePhoto}
              videoRef={s.videoRef}
              fileInputRef={s.fileInputRef}
              handleFileSelect={s.handleFileSelect}
            />
          )}
        </main>

        <footer className="footer">
          ShredOS v7 · {s.userProfile.tdee}kcal TDEE · 12W Sprint
        </footer>
      </div>
    </>
  );
}
