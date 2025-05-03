import React, { useState, useEffect } from 'react';
import styles from './CreateLegionForm.module.css';
import { useRouter } from 'next/navigation';
import Input from '../input/Input';
import NumberInput from '../numberInput/NumberInput';
import { submitLegion, incrementUserLegions } from '@/firebase';
import Button from '../button/Button';
import { musicLeaguePrompts } from '@/data/defaultPrompts';
import { status, stage } from '@/utils/status';

const CreateLegionForm = ({ currentUser }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    legionName: '',
    legionDescription: '',
    maxNumPlayers: 1,
    numRounds: 1,
    voteTime: 1,
    submitTime: 1,
    upVotesPerRound: 1,
    downVotesPerRound: 0,
    players: [],
    playerTokens: [],
    legionAdmin: '',
    currentRound: 1,
    standings: [],
    isPrivate: false,
    isActive: true,
  });

  const [step, setStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);

  useEffect(() => {
    validateStep();
  }, [formData, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === 'legionName' || name === 'legionDescription'
          ? value
          : value === ''
          ? ''
          : parseInt(value, 10),
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      setIsStepValid(
        formData.legionName.length > 5 &&
          formData.legionName.length < 40 &&
          formData.legionDescription.length >= 0 &&
          formData.legionDescription.length < 150
      );
    } else if (step === 2) {
      setIsStepValid(
        formData.maxNumPlayers > 0 && formData.maxNumPlayers <= 20
      );
    } else if (step === 3) {
      setIsStepValid(
        formData.numRounds > 0 &&
          formData.numRounds <= 20 &&
          formData.voteTime > 0 &&
          formData.submitTime > 0
      );
    } else if (step === 4) {
      setIsStepValid(
        formData.upVotesPerRound > 0 && formData.downVotesPerRound >= 0
      );
    }
  };

  const handleNext = () => {
    if (isStepValid) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (isStepValid) {
      try {
        const sanitizedFormData = Object.fromEntries(
          Object.entries(formData).filter(([_, value]) => value !== undefined)
        );

        const rounds = [];
        for (let index = 0; index < sanitizedFormData.numRounds; index++) {
          const roundNumber = index + 1;

          let submissionDeadline = new Date();
          if (roundNumber === 1) {
            submissionDeadline.setDate(
              submissionDeadline.getDate() + sanitizedFormData.submitTime
            );
          } else {
            const previousVoteDeadline = new Date(
              rounds[index - 1].voteDeadline
            );
            submissionDeadline = new Date(previousVoteDeadline);
            submissionDeadline.setDate(
              submissionDeadline.getDate() + sanitizedFormData.submitTime
            );
          }

          const voteDeadline = new Date(submissionDeadline);
          voteDeadline.setDate(
            voteDeadline.getDate() + sanitizedFormData.voteTime
          );

          const randomPrompt =
            musicLeaguePrompts[
              Math.floor(Math.random() * musicLeaguePrompts.length)
            ];

          rounds.push({
            roundNumber,
            submissionDeadline: submissionDeadline.toISOString(),
            voteDeadline: voteDeadline.toISOString(),
            submissions: [],
            playersVoted: [],
            prompt: randomPrompt,
            roundStatus: roundNumber === 1 ? status.ACTIVE : status.PENDING,
            roundStage: stage.SUBMISSION,
          });
        }

        const updatedFormData = {
          ...sanitizedFormData,
          legionAdmin: {
            userId: currentUser.uid,
            username: currentUser.username,
            profileImg: currentUser.profileImg,
          },
          players: [
            ...sanitizedFormData.players,
            {
              userId: currentUser.uid,
              username: currentUser.username,
              profileImg: currentUser.profileImg,
            },
          ],
          playerTokens: [
            ...sanitizedFormData.playerTokens,
            currentUser.fcmToken,
          ],
          rounds,
        };

        const result = await submitLegion(updatedFormData);
        console.log('result', result)
        console.log('updated form data', updatedFormData)
        if (result.success) {
          await incrementUserLegions(currentUser.uid);
          const newLegionId = result.id;
          router.push(`/legions/${newLegionId}`);
        } else {
          alert('Error creating legion.');
        }
      } catch (error) {
        
        console.error('Error creating legion:', error);
        alert('An error occurred while creating the legion.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.title}>Create a Legion</div>
      {step === 1 && (
        <div className={styles.inputField}>
          <Input
            className={styles.inputField}
            type="text"
            name="legionName"
            value={formData.legionName}
            onChange={handleChange}
            placeholder="Legion Title"
            label="Legion Title"
            required
            maxLength={100}
          />
          <Input
            className={styles.inputField}
            type="text"
            name="legionDescription"
            value={formData.legionDescription}
            onChange={handleChange}
            placeholder="Legion Description"
            label="Legion Description"
            required
            maxLength={100}
          />
          <div className={styles.checkboxGroup}>
            Private Legion
            <label className={styles.container}>
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate || false}
                onChange={() =>
                  setFormData((prevData) => ({
                    ...prevData,
                    isPrivate: !prevData.isPrivate,
                  }))
                }
              />
              <div className={styles.checkmark}></div>
            </label>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <NumberInput
            className={styles.inputField}
            name="maxNumPlayers"
            value={formData.maxNumPlayers}
            onChange={handleChange}
            label="Max Number of Players"
            required
            min={1}
            max={20}
          />
          <NumberInput
            className={styles.inputField}
            name="numRounds"
            value={formData.numRounds}
            onChange={handleChange}
            label="Number of Rounds"
            required
            min={1}
            max={20}
          />
        </div>
      )}
      {step === 3 && (
        <div>
          <NumberInput
            className={styles.inputField}
            name="submitTime"
            value={formData.submitTime}
            onChange={handleChange}
            label="Song Submission Time (in days)"
            required
            min={1}
            max={7}
          />
          <NumberInput
            className={styles.inputField}
            name="voteTime"
            value={formData.voteTime}
            onChange={handleChange}
            label="Vote Time (in days)"
            required
            min={1}
            max={7}
          />
        </div>
      )}
      {step === 4 && (
        <div>
          <NumberInput
            className={styles.inputField}
            name="upVotesPerRound"
            value={formData.upVotesPerRound}
            onChange={handleChange}
            label="Number of upvotes per round"
            required
            min={1}
            max={20}
          />
          <NumberInput
            className={styles.inputField}
            name="downVotesPerRound"
            value={formData.downVotesPerRound}
            onChange={handleChange}
            label="Number of down votes per round"
            required
            min={1}
            max={20}
          />
        </div>
      )}
      <div className={styles.buttonContainer}>
        {step > 1 && <Button onClick={handlePrevious}>Previous</Button>}
        {step < 4 && (
          <Button
            onClick={handleNext}
            disabled={!isStepValid}
            variant={isStepValid ? 'blue' : 'disabled'}
          >
            Next
          </Button>
        )}
        {step === 4 && (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid}
            variant={isStepValid ? 'blue' : 'disabled'}
          >
            Start Legion
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateLegionForm;
