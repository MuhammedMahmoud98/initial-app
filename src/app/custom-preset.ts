import { definePreset } from '@primeng/themes';

import Aura from '@primeng/themes/aura';
import { AuraBaseDesignTokens } from '@primeng/themes/aura/base';

const stcPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: 'var(--primary-50)',
      100: 'var(--primary-100)',
      200: 'var(--primary-200)',
      300: 'var(--primary-300)',
      400: 'var(--primary-400)',
      500: 'var(--primary-500)',
      600: 'var(--primary-600)',
      700: 'var(--primary-700)',
      800: 'var(--primary-800)',
      900: 'var(--primary-900)',
    },

    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: 'var(--silver-50)',
          100: 'var(--silver-100)',
          200: 'var(--silver-200)',
          300: 'var(--silver-300)',
          400: 'var(--silver-400)',
          500: 'var(--silver-500)',
          600: 'var(--silver-600)',
          700: 'var(--silver-700)',
          800: 'var(--silver-800)',
          900: 'var(--silver-900)',
        },

        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.500}',
          activeColor: '{primary.600}',
        },
        content: {
          borderColor: '{surface.100}',
          hoverBackground: '{surface.50}',
          color: '{surface.900}',
          background: '{surface.0}',
        },
        formField: {
          borderColor: '{surface.100}',
          hoverBorderColor: '{surface.200}',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: 'var(--gray-50)',
          100: 'var(--gray-50)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },
        primary: {
          color: '{primary.400}',
          contrastColor: '{surface.900}',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        content: {
          borderColor: '{surface.800}',
          hoverBackground: '{surface.50}',
          background: '{surface.900}',
        },
      },
    },
  },
  components: {
    toggleswitch: {
      colorScheme: {
        light: {
          background: 'var(--silver-400)',
          hover: {
            background: 'var(--silver-500)',
          },
          disabledBackground: 'var(--secondary-300)',
          root: {
            focusRing: {
              color: 'var(--primary-500)',
            }
          },
          borderRadius: 'var(--btn-border-radius)',
          handle: {
            checkedColor: 'white',
            borderRadius: '0',
            disabledBackground: 'var(--gray-0)',
          },
          checked: {
            background: 'var(--secondary-500)',
            hover: {
              background: 'var(--secondary-600)',
            },
          },
        },
      },
    },
    button: {
      colorScheme: {
        label: {
          font: {
            weight: 'var(--btn-default-font-weight)',
          },
        },
        padding: {
          x: '1.2rem',
          y: '.7rem',
        },
        border: {
          radius: 'var(--btn-border-radius)',
        },

        secondary: {
          background: 'var(--secondary-500)',
          color: '#ffff',
          border: {
            color: 'var(--secondary-500)',
          },
          hover: {
            background: 'var(--secondary-600)',
            color: '#ffff',
            border: {
              color: 'var(--secondary-600)',
            },
          },
          active: {
            background: 'var(--secondary-400)',
            color: '#ffff',
            border: {
              color: 'var(--secondary-400)',
            },
          },
          focus: {
            ring: {
              color: 'var(--secondary-500)',
            },
          },
          // Add disabled state here
          disabled: {
            background: '#f5f5f5',
            color: '#999999',
            border: {
              color: '#e0e0e0',
            },
            cursor: 'not-allowed',
          },
        },
        contrast: {
          background: 'var(--gray-0)',
          color: 'var(--onyx-500)',
          border: {
            color: 'var(--silver-300)',
          },

          hover: {
            background: 'var(--silver-100)',
            color: '#000',
            border: {
              color: 'var(--silver-300)',
            },
          },
          active: {
            background: 'var(--silver-300)',
            color: 'var(--onyx-500)',
            border: {
              color: 'var(--silver-300)',
            },
          },
          focus: {
            ring: {
              color: 'var(--secondary-500)',
            },
          },
        },
        outlined: {
          primary: {
            background: 'transparent',
            color: 'var(--primary-500)',
            border: {
              color: 'var(--primary-500)',
            },
            hover: {
              background: 'var(--primary-100)',
              color: 'var(--gray-800)',
              border: {
                color: 'var(--gray-100)',
              },
            },
            active: {
              background: 'var(--gray-200)',
            },
          },
          secondary: {
            background: 'var(--secondary-500)',
            color: 'var(--secondary-500)',
            border: {
              color: 'var(--secondary-500)',
            },
            hover: {
              background: 'var(--secondary-100)',
              border: {
                color: 'var(--secondary-400)',
              },
            },
            active: {
              background: 'var(--secondary-400)',
              color: '#ffff',
              border: {
                color: 'var(--secondary-400)',
              },
            },
            focus: {
              ring: {
                color: 'var(--secondary-500)',
              },
            },
          },
        },
      },
    },
    card: {
      colorScheme: {
        shadow: 'none',
      },
      border: {
        radius: 'var(--card-border-radius)',
      },
      body: {
        padding: '0',
      },
    },
    menu: {
      colorScheme: {
        light: {
          item: {
            focusBackground: 'var(--gray-50)',
          },
        },
        dark: {
          item: {
            focusBackground: 'var(--gray-800)',
          },
        },
      },
    },

    tooltip: {
      colorScheme: {
        max: {
          width: '30rem',
        },
        border: {
          radius: '0.25rem',
        },
        padding: '0.85rem',
        light: {
          background: 'var(--onyx-500)',
          color: 'var(--gray-0)',
        },
      },
    },
    skeleton: {
      colorScheme: {
        light: {
          background: 'var(--skeleton-bg)',
        },
        dark: {
          background: '{surface.800}',
        },
      },
    },
    progressbar: {
      colorScheme: {
        light: {
          background: 'var(--gray-200)',
          value: {
            background: 'var(--primary-500)',
          },
        },
      },
    },
    select: {
      borderRadius: 'var(--stc-radius)',
      shadow: 'none',
      colorScheme: {
        light: {
          overlay: {
            border: {
              color: '{surface.100}',
            },
          },
          option: {
            focus: {
              background: 'var(--gray-50)',
            },
          },
        },
      },
    },
    fileupload: {
      background: 'transparent',
      border: {
        color: 'transparent',
      },
      progressbar: null,
      header: {
        padding: '0',
      },
      content: {
        padding: '16px',
        gap: '0',
      }
    },
    message: {
      border: {
        radius: '6px',
        width: '0px',
      },
      text: {
        font: {
          weight: '500',
          size: '12px',
        },
      },
      content: {
        gap: '10px'
      },
      colorScheme: {
        light: {
          info: {
            background: 'var(--primary-50)',
            color: 'var(--primary-500)',
            close: {
              button: {
                hover: {
                  background: 'var(--primary-300)',
                },
              },
            },
          },
          success: {
            background: 'var(--success-200)',
            color: 'var(--success-500)',
          },
          error: {
            background: 'var(--danger-200)',
            color: 'var(--danger-500)',
            outline: 'none'
          },
        },
      },
    },
    inputtext: {
      borderRadius: 'var(--stc-radius)',
      shadow: 'none'
    },
    multiselect: {
      shadow: 'none',
    },
    datatable: {
      colorScheme: {
        header: {
          cell: {
            padding: '1rem',
            color: 'var(--silver-600)',
          },
      },
        body: {
          cell: {
            padding: '0.5rem 1rem'
          },
        }
      }
    },
    confirmdialog: {
      icon: {
        color: 'var(--primary-500)',
      }
    },
    progressspinner: {
      colorScheme: {
        color: {
          one: 'var(--primary-300)',
          two: 'var(--primary-400)',
          three: 'var(--primary-500)',
          four: 'var(--secondary-500)',
        },
      }
    },
    datepicker: {
      input: {
        icon: {
          color: 'var(--onyx-500)',
        },
      }
    },
    checkbox: {
      border: {
        color: 'var(--silver-400)',
        radius: 'var(--btn-border-radius)'
      },
      checked: {
        background: 'var(--secondary-500)',
        border: {
          color: 'var(--secondary-500)',
        },
        hover: {
          background: 'var(--secondary-500)',
          border: {
            color: 'var(--secondary-500)',
          },
        }
      },
      hover: {
        border: {
          color: 'var(--secondary-500)'
        }
      }
    },
    paginator: {
      nav: {
        button: {
          color: 'var(--onyx-500)',
          selected: {
            background: 'var(--primary-500)',
            color: 'var(--gray-0)'
          },
          border: {
            radius: 'var(--stc-radius)'
          }
        }
      }
    }
  },
} as AuraBaseDesignTokens);

export { stcPreset };
