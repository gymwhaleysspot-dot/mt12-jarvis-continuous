#include <stdio.h>

typedef struct cst_voice_struct cst_voice;

void flite_init(void);
float flite_text_to_speech(const char *text, cst_voice *voice, const char *outtype);
cst_voice *register_cmu_us_rms(const char *voxdir);
cst_voice *register_cmu_us_slt(const char *voxdir);

int main(int argc, char **argv) {
  if (argc != 4) {
    fprintf(stderr, "usage: %s rms|slt output.wav text\n", argv[0]);
    return 2;
  }
  flite_init();
  cst_voice *voice = argv[1][0] == 's'
    ? register_cmu_us_slt(NULL)
    : register_cmu_us_rms(NULL);
  if (!voice) return 3;
  return flite_text_to_speech(argv[3], voice, argv[2]) > 0 ? 0 : 4;
}
